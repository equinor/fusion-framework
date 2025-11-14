export type FileStatus = 'new' | 'modified' | 'removed';

export type SourceFile = {
  path: string;
  projectRoot?: string;
  relativePath?: string;
  status: FileStatus;
};
