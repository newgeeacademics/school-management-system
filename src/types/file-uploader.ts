export type FileUploaderProps = {
  files: File[] | undefined;
  onChange: (files: File[]) => void;
  type?: 'profile' | 'banner';
  maxSizeText?: string;
  currentImageUrl?: string;
};
