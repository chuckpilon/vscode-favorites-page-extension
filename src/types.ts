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

type Settings = {
	panel: {
		title: string,
		iconPath?: string,
	},
	title: string,
	subtitle: string,
	resourceDirectory?: string;
	folderGroups: Array<FolderGroup>
};

