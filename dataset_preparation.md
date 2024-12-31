The directory of this repository "repo-burst" will be referred to as `repo-burst`

1. Clone the git repository you want to analyze to a directory outside of `repo-burst`. The newly created directory where the repository has been cloned into will now be called `data_repository`.

2. Write the names or hashes of all commits you want to analyze into a text file called `output.txt` in `data_repository`. Each name has to go on a new line. To do that for all tagged commits of a repository, proceed with the next step. If you want to prepare a different set of commits, prepare that text file and proceed to step 6.

3. Open a powershell in `data_repository`.

4. Now type: ```git tag | Out-File -FilePath "[PATH TO DATA_REPOSITORY]\data_repository\output.txt"```  
(e.g. ```git tag | Out-File -FilePath "C:\data_repository\output.txt"```)

5. That output file contains the names of all tags in the repository. If you only want to analyze some of those tags, delete all the other lines. Make sure there are no gaps between lines, that each tag name is in its own new line and that the commits are in chronological order, or in the order you want them in. Also make sure that the file is UTF-8 encoded or the next step won't work.

6. Now open a command prompt in `data_repository.`  
Execute this command: ```for /F "tokens=*" %A in (output.txt) do git archive %A -o "[OUTPUT PATH]%A.zip"```  
(e.g. ```for /F "tokens=*" %A in (output.txt) do git archive %A -o "C:\archives\%A.zip"```).  
The output path shouldn't be in `data_repository`. Make sure the output folder already exists! (Source for actions up to here: https://stackoverflow.com/a/72564390)

7. Navigate to the output directory of that command. Rename the archives in such a way that, when ordered lexicographically, their order corresponds to the order you had your commit names in step 5.

**Before:**
```
v1.10.0.zip
v1.7.0.zip
v1.8.0.zip
v1.9.0.zip
```
**After:**
```
v1.07.0.zip
v1.08.0.zip
v1.09.0.zip
v1.10.0.zip
```
8. Now extract all these archives to their own new folders. If you are using 7zip, open the `Extract files...` dialog from either the context menu or the 7zip File Explorer. Under the first text field where the target extraction directory can be specified, there is another text field that currently contains the string `*\`.  
Append a placeholder folder name behind it like so:

**Before:**
```
*\
```
**After:**
```
*\[PLACEHOLDER]\
```
9. Replace `[PLACEHOLDER]` with a term of your choosing and extract. This folder will act as a separator of data and your filesystem, such that the processed dataset won't contain any possibly sensitive data about your file path names.  
If you are not using 7zip, extract the archives as normal into their own directories.  Now, move the contents of each of these directories into a folder with the placeholder folder name in each directory as such:  

**Before:**
```
v1.07.0/...
v1.08.0/...
v1.09.0/...
v1.10.0/...
```
**After:**
```
v1.07.0/[PLACEHOLDER]/...
v1.08.0/[PLACEHOLDER]/...
v1.09.0/[PLACEHOLDER]/...
v1.10.0/[PLACEHOLDER]/...
```
To do that, freely available software like [Bulk Rename Utility](https://www.bulkrenameutility.co.uk/) can be used.    

10. Remove the `.zip`-archives from the directory of extracted directories.

11. These directories can now be transferred to `repo-burst/data/raw_data/`
    It should then look like this:
```
repo-burst
└── data
    └── raw_data
        ├── v1.07.0/[PLACEHOLDER]/...
        ├── v1.08.0/[PLACEHOLDER]/...
        ├── v1.09.0/[PLACEHOLDER]/...
        └── v1.10.0/[PLACEHOLDER]/...
```

12. Go back to `data_repository`. Create 2 copies of `output.txt`. Call those copies ```startcommits.txt``` and ```endcommits.txt```.

13. Open ```startcommits.txt``` and duplicate the first line so that it repeats on line 1 and 2.  
Then delete the last line of `startcommits.txt`. `endcommits.txt` remains unchanged.

**startcommits.txt before:**
```
v1.0.0
v2.0.0
v3.0.0
v4.0.0
```
**startcommits.txt after:**
```
After: 
v1.0.0
v1.0.0
v2.0.0
v3.0.0
```
**endcommits.txt:**
```
v1.0.0
v2.0.0
v3.0.0
v4.0.0
```

9. Find the file ```outputDiffCommands.bat``` in `repo_burst`. Copy it to `data_repository`.  
(Source for the `.bat` file: https://stackoverflow.com/a/12101203)

10. Run ```outputDiffCommands.bat``` from the command line. When you are working with large repositories, two warnings may appear:
```
warning: exhaustive rename detection was skipped due to too many files.
warning: you may want to set your diff.renameLimit variable to at least XXXX and retry the command.
```
If those appear, you can run the command ```git config diff.renameLimit XXXX```. This will increase the accuracy of the logged changes. 
If you had to do that, delete the newly created `changes.txt` in `data_repository` and run ```outputDiffCommands.bat``` again.

11. The file `changes.txt` will be created in `data_repository`. Open it. Use a tool like `Notepad++` to format it as such:  

**Before:**
```
 5982 files changed, 12182 insertions(+), 25640 deletions(-)
 4887 files changed, 4354 insertions(+), 5695 deletions(-)
 1246 files changed, 23257 insertions(+), 8510 deletions(-)
 98 files changed, 1154 insertions(+), 1123 deletions(-)
 26 files changed, 791 insertions(+), 190 deletions(-)
 9 files changed, 25 insertions(+), 12 deletions(-)
 19 files changed, 95 insertions(+), 27 deletions(-)
 47 files changed, 428 insertions(+), 320 deletions(-)
```
**After:**
```
changes,insertions,deletions
0,0,0
5982,12182,25640
4887,4354,5695
1246,23257,8510
98,1154,1123
26,791,190
9,25,12
19,95,27
47,428,320
```
Make sure that the first line of the changed file reads: ```changes,insertions,deletions```  
Make sure that there are no spaces in the changed file.
Make sure to insert the line reading ```0,0,0``` between the column names and the start of the data. ```0,0,0``` represents the changes, insertions and deletions at the first scanned commit. There are none, so all of the data is `0`.

12. Transfer `changes.txt` to  ```repo-burst/data/```.

13. Open a command-line in `repo-burst`.

14. Run the command ```java -jar preprocessor.jar [DATA PATH] [PLACEHOLDER]```.  
(e.g. ```java -jar preprocessor.jar "C:\repo-burst\data\raw_data" separator```)  
Replace `[DATA PATH]` with the location of the extracted archives. If you followed this manual, it should be `repo-burst\data\raw_data`. Input an absolute path and do not append an extra `\`  
Replace `[PLACEHOLDER]` with the placeholder from step 9.

15. Your dataset should be preprocessed and ready to use! Consult [the "Usage" section from this document](./README.md) for how to display it.