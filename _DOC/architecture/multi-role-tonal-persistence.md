# Multi-role tonal persistence

The tonal builder persists one versioned application document for URL sharing and JSON import/export.

## Version 2 schema

```ts
type TonalPersistenceState = {
  version: 2;
  activeRole: 'surface' | 'primary';
  roles: {
    surface: RoleTonalState;
    primary: RoleTonalState;
  };
  preview: {
    darkMode: boolean;
    surfaceContrast: 'low' | 'medium' | 'high';
    lightSurfaceTone: number;
    darkSurfaceTone: number;
    primarySurfaceContrast: 'low' | 'medium' | 'high';
    primaryLightSurfaceTone: number;
    primaryDarkSurfaceTone: number;
  };
};
```

Each role stores its base color, blend color, blend mode, generation controls, and independent
surface-preview mapping settings. Generated strips and transient UI state are derived and are not
serialized.

URLs compress the JSON document with LZ-string, encode it for URI safety, and store it in a versioned fragment such as `#v2=N4Ig...`. Fragment data is not sent to the server. JSON import/export uses the uncompressed document and the same validation path.

## Legacy migration

Unversioned single-scale objects, the previous `?config=<json>` format, and legacy flat URL parameters are interpreted through the migration path. Single-scale data becomes the surface role and the primary role receives its default configuration. Unsupported explicit schema versions are rejected atomically.
