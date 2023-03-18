type Folder = {
	id: string,
	description: string,
	location: string
};

type FolderGroup = {
	id: string,
	title: string,
	iconPath?: string,
	folders: Array<Folder> 
};

type GitLabSettings = {
	url: string;
	privateToken: string;
	localRootPath: string;
	renameGroups: Record<string, string>;
	renamePaths: Record<string, string>;
};

type Settings = {
	panel: {
		title: string,
		iconPath?: string,
	},
	gitLab?: GitLabSettings;
	title: string,
	subtitle: string,
	resourceDirectory?: string;
	folderGroups: Array<FolderGroup>
};

type GitLabProject = {
	id: number;
	path: string;
	name: string;
	path_with_namespace: string;
	namespace: {
		id: number;
		name: string;
		full_path: string;
	}
};