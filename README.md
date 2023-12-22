# DataVisG40
Data visualisation of car accidents in France, for InfoVis assignment TU Delft Group 40


## Code structure
In the data folder we have all the data files in a csv format. The DataProcess folder contains the implementation datafetch.js, which is the implementation of our data processing. The original files used for this are not in the data folder due to file size limitations, they can be found at https://www.kaggle.com/datasets/ahmedlahlou/accidents-in-france-from-2005-to-2016?select=users.csv. queryGraphData.js contains the implemtation of the data queries done for updating the graphs. The implementation of the graphs can be found in the graphs folder, containing the pie, stacked and heatmap implementations.
The including with its logic is devided over ui.html and uiHandler.js. The images folder contains images for styling the html and should not be of any use.

## Run the code
The only requirement for reading the code is the VS Live Server extension. Running our ui.html with the live server should make it load in you browser. The current dataset consist of accidents from the years 2015-2012. For a smoother experience one could opt to chose the smaller dataset (2015-2014) by changing the data load statement in uiHandler.js lines 21 22
