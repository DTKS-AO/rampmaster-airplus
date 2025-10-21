import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Camera, FileImage, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onUpload: (file: File) => Promise<string>;
  isUploading?: boolean;
  disabled?: boolean;
}

export function PhotoUpload({
  value,
  onChange,
  onUpload,
  isUploading,
  disabled,
}: FileUploadProps) {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    // Basic validation
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor envie apenas imagens');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Imagem deve ter menos de 5MB');
      return;
    }

    try {
      const url = await onUpload(file);
      onChange(url);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Erro ao enviar imagem');
    }
  }, [onUpload, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    },
    maxFiles: 1,
    disabled: disabled || isUploading,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        relative flex flex-col items-center justify-center 
        w-full h-48 border-2 border-dashed rounded-lg 
        cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted'}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input {...getInputProps()} />

      {value ? (
        <div className="relative w-full h-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Uploaded photo"
            className="w-full h-full object-cover rounded-lg"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-muted-foreground">
          {isUploading ? (
            <>
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="mt-2 text-sm">A enviar...</p>
            </>
          ) : (
            <>
              <FileImage className="w-8 h-8" />
              <p className="mt-2 text-sm">
                {isDragActive
                  ? 'Solte a imagem aqui'
                  : 'Clique ou arraste uma imagem'}
              </p>
              <p className="mt-1 text-xs">
                PNG, JPG ou GIF (max. 5MB)
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}