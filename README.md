# repo-burst

A tool to visualize dependency changes of large code repositories using a hybrid sunburst-chord-graph in the browser.

## Installation

- Clone this repository to a directory of you choosing.  
- Install [http-server](https://github.com/http-party/http-server).
- If you want to process your own dataset, install any flavor of JDK Development Kit v21. [Eclipse Temurin was used for development.](https://adoptium.net/temurin/releases/?package=jdk&version=21)  
- If you want to modify the code, install both the [JDK](https://adoptium.net/temurin/releases/?package=jdk&version=21) and [Rollup](https://rollupjs.org/) as the build tool.

## Usage

- If you want to visualize your own dataset, see [this document.](./dataset_preparation.md)

- Two different datasets have been prepared. One dataset consisting of all tagged commits of [svelte](https://github.com/sveltejs/svelte). Another dataset consisting of all tagged commits of [d3](https://github.com/d3/d3).   
To use either of those, copy the contents of the repsective folder in `repo-burst\data\backup\` to `repo-burst\data\` and replace files if prompted.

1. Open a command line in the root directory of this repository.

2. Execute the command `http-server`. Open one of the links under `Available on:`. A browser window containing the repo-burst tool should open.


- You will see two sunburst diagrams side-by-side of each other.  
You can interact with them by zooming and panning like on any navigation app.  
You can hover over arc segments and chords to get more information about them.  
You can also click on any arc segment to open it as a root folder.  
Click the "Go up one level" button on the bottom of the page to change the displayed root folder to the parent of the current root folder.
- Directly below the sunbursts is the file path of the currently displayed time step.  
Below that is the time step navigation bar. You can zoom in and out of it by hovering over it and scrolling.  
When hovering over the time step navigation bar, a time step will be selected. The green bar signifies how many lines were inserted from the last time step to the time step you are hovering over. The red bar does the same for lines that were deleted. Clicking on the bar selects it and displays it on the sunburst view.
- Below the time step bar, two sliders called `First level` and `Last level` can be found. Adjusting them changes which is the first level that is displayed on the sunburst and which is the last. Use this to change from an overview to a more detailed view that shows a lot of the file structure.
- Below those sliders, a text box named `File search` can be found. Enter a file name or folder name want to search into it and click the button marked `Search` next to it. All matching files will be marked by a black border on the sunburst. A dropdown list of all files and folders that match you search term will be displayed. Click the wanted result. Press the `Show results` and the selected result will be opened as the root folder.  
Do note that only currently displayed elements will be searched. Displayed levels might have to be adjusted to find the wanted file.
- All of these functions can be performed on both sunbursts using the controls that are found below them.
- To use the `Display Difference` button on the top of the page, first set the two sunbursts to states you want to compare. You should usually always display the same levels on both of them, but with differing displayed time steps.  
Press the `Display Difference` button and the elements that appear only in either sunburst will highlighted and listed on the bottom of the page in a new dropdown menu.
- To reset the displayed sunbursts and erase all highlights, press the `RESET` button on the top of the page.