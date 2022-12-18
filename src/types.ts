type Repository = {
	id: string,
	title: string,
	description: string,
	location: string
};

type RepositoryGroup = {
	id: string,
	title: string,
	iconPath?: string,
	repositories: Array<Repository> 
};

type Settings = {
	panel: {
		title: string,
		iconPath?: string,
	},
	productName: string,
	tagLine: string,
	resourceDirectory?: string;
	groups: Array<RepositoryGroup>
};

