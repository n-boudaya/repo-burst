package fileTypes;

import org.json.JSONArray;
import org.json.JSONObject;
import java.nio.file.*;
import java.util.*;

public class HierarchyAndDepends {
    private final JSONObject hierarchy;
    private final JSONArray dependencies;
    private final Set<Path> incoming;
    private final Map<Path, Integer> outgoing;
    private final Set<Path> external;

    public HierarchyAndDepends(final JSONObject hierarchy, final JSONArray dependencies, final Set<Path> incoming, final Map<Path, Integer> outgoing, final Set<Path> external) {
        this.hierarchy = hierarchy;
        this.dependencies = dependencies;
        this.incoming = incoming;
        this.outgoing = outgoing;
        this.external = external;
    }

    public JSONObject getHierarchy() {
        return hierarchy;
    }

    public JSONArray getDependencies() {
        return dependencies;
    }

    public Set<Path> getIncoming() {
        return incoming;
    }

    public Map<Path, Integer> getOutgoing() {
        return outgoing;
    }

    public Set<Path> getExternal() {
        return external;
    }
}
