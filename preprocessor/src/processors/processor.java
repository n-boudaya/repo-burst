package processors;

import java.nio.file.*;
import java.util.ArrayList;

import fileTypes.data_element;

//Abstract processor. All processors should adhere to this.
public abstract class processor {

    //Should return the file extensions of supported file types
    //Example output: ["js","javascript","ts"]
    public abstract ArrayList<String> getFileTypes();

    //Returns a list of imports in the file p
    public abstract ArrayList<data_element> getImports(Path p);
}
