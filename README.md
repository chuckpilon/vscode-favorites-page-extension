# Favorites Page

Favorites Page replaces Visual Studio Code's Get Started page. Favorites page always displays a configurable list of projects instead of recent projects as on the Get Started page.

## Features

Describe specific features of your extension including screenshots of your extension in action. Image paths are relative to this README file.

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

This extension contributes the following settings:

* `favoritesPage`: Define the layout
* `favoritesPage.panel`: Define the tab
* `favoritesPage.panel.title`: Text for the tab
* `favoritesPage.title`: Title text
* `favoritesPage.subtitle`: Subtitle text
* `favoritesPage.folderGroups`: Groups of folders
* `favoritesPage.folderGroups[].id`: Unique Id for the folder group
* `favoritesPage.folderGroups[].title`: Text for the folder group
* `favoritesPage.folderGroups[].folders`: Folders within the folder group
* `favoritesPage.folderGroups[].folders[].id`: Unique Id for the folder
* `favoritesPage.folderGroups[].folders[].description`: Repository text
* `favoritesPage.folderGroups[].folders[].location`: Path of the repository

```
"favoritesPage": {
    "panel": {
        "title": "Favorites"
    },
    "title": "Visual Studio Code",
    "subtitle": "Editing evolved",
    "folderGroups": [
        {
            "id": "group1",
            "title": "Group 1",
            "folders": [
                {
                    "id": "group-1-project-1",
                    "description": "Group 1 Project 1",
                    "location": "~/code/group1/project1"
                },
                ...
            ]
        },
        ...
    ],
```

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of Favorites Page

