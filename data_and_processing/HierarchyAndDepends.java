package data_and_processing;

import org.json.JSONArray;
import org.json.JSONObject;

public class HierarchyAndDepends {
    private final JSONObject hierarchy;
    private final JSONArray dependencies;

    public HierarchyAndDepends(final JSONObject hierarchy, final JSONArray dependencies) {
        this.hierarchy = hierarchy;
        this.dependencies = dependencies;
    }

    public JSONObject getHierarchy() {
        return hierarchy;
    }

    public JSONArray getDependencies() {
        return dependencies;
    }
}
