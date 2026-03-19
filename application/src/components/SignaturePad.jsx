import React, { useState, useRef, useEffect } from 'react';
import { Eraser, Pencil, ImagePlus, MousePointerClick } from 'lucide-react';

const SignaturePad = ({ onSignatureChange }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('draw'); // 'draw' | 'upload'
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasContent, setHasContent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Gestion du redimensionnement du canvas
  useEffect(() => {
    const resizeCanvas = () => {
      if (mode === 'draw' && canvasRef.current && containerRef.current) {
        const canvas = canvasRef.current;
        const container = containerRef.current;
        
        // Sauvegarder le contenu actuel si possible (souvent perdu lors du resize canvas)
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        if(hasContent) tempCtx.drawImage(canvas, 0, 0);

        // Redimensionner
        canvas.width = container.offsetWidth;
        canvas.height = 200; // Hauteur fixe

        // Restaurer le contexte de dessin
        const ctx = canvas.getContext('2d');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e3a8a';
        
        // Tenter de redessiner (simple scaling)
        if (hasContent && tempCanvas.width > 0) {
            ctx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, canvas.width, canvas.height);
        }
      }
    };

    // Initial resize
    resizeCanvas();
    
    // Add event listener
    window.addEventListener('resize', resizeCanvas);
    
    // Cleanup
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [mode, hasContent]); // Re-run when mode changes

  // Re-apply context settings cleanly when mode changes to draw
  useEffect(() => {
    if (mode === 'draw' && canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#1e3a8a';
    }
  }, [mode]);

  const getCoordinates = (event) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    if (event.touches && event.touches.length > 0) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    if (mode !== 'draw') return;
    try {
      if (e.cancelable) e.preventDefault();
      
      const { x, y } = getCoordinates(e);
      const ctx = canvasRef.current.getContext('2d');
      ctx.beginPath();
      ctx.moveTo(x, y);
      setIsDrawing(true);
    } catch (err) {
      console.error("Erreur dessin", err);
    }
  };

  const draw = (e) => {
    if (!isDrawing || mode !== 'draw') return;
    if (e.cancelable) e.preventDefault(); // Prevent scrolling on mobile
    
    const { x, y } = getCoordinates(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasContent(true);
  };

  const stopDrawing = () => {
    if (isDrawing && mode === 'draw') {
      setIsDrawing(false);
      onSignatureChange(canvasRef.current.toDataURL('image/png'));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert("Format de fichier non supporté. Veuillez utiliser un fichier PNG ou JPG.");
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert("L'image est trop volumineuse (max 5Mo)");
        e.target.value = '';
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        setPreviewUrl(dataUrl);
        setHasContent(true);
        onSignatureChange(dataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReset = () => {
    if (mode === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    } else {
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
    setHasContent(false);
    onSignatureChange(null);
  };

  const toggleMode = (newMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    setHasContent(false);
    onSignatureChange(null);
    setPreviewUrl(null);
  };

  return (
    <div className="flex flex-col items-center w-full gap-4">
      {/* Onglets de sélection du mode */}
      <div className="flex bg-slate-100 p-1.5 rounded-xl self-center sm:self-start shadow-inner">
        <button 
            type="button"
            onClick={() => toggleMode('draw')}
            className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'draw' ? 'bg-white text-[#003366] shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
            <Pencil className="w-4 h-4 mr-2" strokeWidth={2} />
            Tracer
        </button>
        <button 
              type="button"
              onClick={() => toggleMode('upload')}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${mode === 'upload' ? 'bg-white text-[#003366] shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
        >
            <ImagePlus className="w-4 h-4 mr-2" strokeWidth={2} />
            Importer
        </button>
      </div>

      <div ref={containerRef} className="w-full">
        {mode === 'draw' ? (
        <div className="relative w-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-hidden touch-none select-none" style={{ height: '200px' }}>
          <canvas
            ref={canvasRef}
            className="w-full h-full cursor-crosshair touch-none"
            style={{ touchAction: 'none' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          {!hasContent && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400">
              <div className="flex flex-col items-center">
                  <MousePointerClick className="w-8 h-8 mb-2 opacity-50" />
                  <span className="text-sm">Signez ici (souris ou doigt)</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full h-[200px] border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex flex-col items-center justify-center p-4 relative overflow-hidden">
          {previewUrl ? (
            <img src={previewUrl} alt="Signature importée" className="max-h-full max-w-full object-contain" />
          ) : (
            <div className="text-center group">
              <div className="mx-auto mb-3 w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <ImagePlus className="w-8 h-8 text-[#003366]/50 group-hover:text-[#003366]" strokeWidth={1.5} />
              </div>
              <p className="text-sm font-medium text-slate-600 mb-1">Cliquez pour importer</p>
              <p className="text-xs text-slate-400 mb-4">PNG, JPG jusqu'à 5Mo</p>
              <input 
                  type="file" 
                  accept="image/png, image/jpeg, image/jpg" 
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden" 
                  id="signature-upload"
              />
              <label 
                  htmlFor="signature-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-blue-200 shadow-sm text-sm font-medium rounded-lg text-[#003366] bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                  Choisir un fichier
              </label>
            </div>
          )}
        </div>
      )}
      </div>

      <div className="flex justify-end w-full">
        <button
          type="button"
          onClick={handleReset}
          className={`flex items-center text-sm font-medium text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-50 ${!hasContent ? 'opacity-50 cursor-not-allowed' : ''}`}
          disabled={!hasContent}
        >
          <Eraser className="w-4 h-4 mr-2" strokeWidth={2} />
          Effacer
        </button>
      </div>
    </div>
  );
};

export default SignaturePad;
