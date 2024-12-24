1. Clone the git repository you want to analyze to a folder outside of repo-burst.
2. Write the names of all commits you want to analyze into a text file in the directory of the repository. Each name has to go on a new line. To do that for all tagged commits of a repository, proceed with the next step. If you want to prepare a different set of commits, prepare that text file and proceed to step 6
3. Open a powershell in the repository directory.
4. Now type 'git tag | Out-File -FilePath "[OUTPUT DIRECTORY AND FILENAME].txt"' (e.g. 'git tag | Out-File -FilePath "C:\output.txt')
5. That output file contains the names of all tags in the repository. If you only want to analyze some of those tags, delete all the other lines. Make sure there are no gaps between lines and that each tag name is in its own, new line. Also make sure, that the commits are in chronological order, or in the order you want them in.
6. Move the file that contains all the names of commits you want to analyze to the root directory of the repository. Make sure that file is UTF-8 encoded!
7. Now open a command prompt in the repository. Execute this command: 'for /F "tokens=\*" %A in ([FILE THAT CONTAINS THE COMMIT NAMES].txt) do git archive %A -o "[OUTPUT DIRECTORY]%A.zip"' (e.g. 'for /F "tokens=\*" %A in (tag_names.txt) do git archive %A -o "C:\archives\%A.zip"'). Make sure the output folder already exists!
8. Navigate to the output direcotry of that command. Unzip all folders, into their own directories. After that, remove the .zip archives.
v1.0.0.zip
v2.0.0.zip
v3.0.0.zip
v4.0.0.zip
=>
v1.0.0/...
v2.0.0/...
v3.0.0/...
v4.0.0/...
9. Rename the directories in such a way that, when ordered alphabetically, their order corresponds to the order you had your commit names in step 5.

v1.10.0/...
v1.7.0/...
v1.8.0/...
v1.9.0/...
=>
v1.07.0/...
v1.08.0/...
v1.09.0/...
v1.10.0/...

10. Now, move the contents of each of these directories into a folder with the same name in each directory. This folder will act as a separator of data and your filesystem, such that the processed dataset won't contain any, possibly sensitive data about your file path names.
    To do that, freely available software like "Bulk Rename Utility" (https://www.bulkrenameutility.co.uk/) can be used.
    Let's say you call that new folder placeholder:

v1.07.0/...
v1.08.0/...
v1.09.0/...
v1.10.0/...
=>
v1.07.0/placeholder/...
v1.08.0/placeholder/...
v1.09.0/placeholder/...
v1.10.0/placeholder/...

11. These directories can now be transferred to repo-burst/data_and_processing/raw_data/
    It should then look like this:

repo-burst
|__data_and_processing
   |__raw_data
      |__v1.07.0/placeholder/...
      |__v1.08.0/placeholder/...
      |__v1.09.0/placeholder/...
      |__v1.10.0/placeholder/...

create 2 copies of the list. call them startcommits.txt and endcommits.txt
duplicate the first line of startcommits.txt so that it repeats on line 1 and 2
then delete the last line of file 1
leave endcommits.txt unchanged
example:
startcommits.txt
v1.0.0
v2.0.0
v3.0.0
v4.0.0

->
startcommits.txt
v1.0.0
v1.0.0
v2.0.0
v3.0.0

endcommits.txt
v1.0.0
v2.0.0
v3.0.0
v4.0.0


9. Find the file "outputDiffCommands.bat" in the root directory repository of this tool. Move it to the repository of your data.
10. Run "outputDiffCommands.bat" from the command line.
11. The file "changes.txt" will be created in the root folder of your data repository. Open it. Use a tool like Notepad++ to format it as such: 
 5982 files changed, 12182 insertions(+), 25640 deletions(-)
 4887 files changed, 4354 insertions(+), 5695 deletions(-)
 1246 files changed, 23257 insertions(+), 8510 deletions(-)
 98 files changed, 1154 insertions(+), 1123 deletions(-)
 26 files changed, 791 insertions(+), 190 deletions(-)
 9 files changed, 25 insertions(+), 12 deletions(-)
 19 files changed, 95 insertions(+), 27 deletions(-)
 47 files changed, 428 insertions(+), 320 deletions(-)
=>
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

Make sure that the first line of the changed file reads: changes,insertions,deletions
Make sure that there are no spaces in the changed file
Make sure to insert the line reading 0,0,0 between the column names and the start of the data. 0,0,0 represents the changes, insertions and deletions at the first scanned commit. There are none, so all of the data is 0.

12. Transfer "changes.txt" to the "data_and_processing" directory of the repo-burst repository.

https://stackoverflow.com/a/72564390

https://stackoverflow.com/a/12101203 option 2
