from osgeo import ogr, osr

def layer_exist(
    connection_string,
    layer_name,
):
    ''' Get Layer from data base if exist '''
    conn = ogr.Open(connection_string)
    layer = conn.GetLayer(layer_name)
    exist = True if layer is not None else False
    conn = None
    return exist

def check_attrs(
    connection_string, 
    attrs,
    layers,
):
    '''returns {} all attrs exist in all layers'''
    conn = ogr.Open(connection_string)
    result = {}
    for layer in layers:
        l = conn.GetLayer(layer)
        layer_defn = l.GetLayerDefn()
        fields_count = layer_defn.GetFieldCount()
        layer_attributes = []
        for i in range(fields_count):
            layer_attributes.append(layer_defn.GetFieldDefn(i).GetName())
        for attr in attrs:
            if attr not in layer_attributes:
                try:
                    result[layer].append(attr)
                except:
                    result[layer] = []
                    result[layer].append(attr)
    conn = None
    return result


def create_out_layer(
    connection_string,
    out_layer_name,
    srs,
    geom_type
):
    ''' Creates a layer in postgreSQL database'''
    conn = ogr.Open(connection_string)
    conn.CreateLayer(
        out_layer_name,
        geom_type=geom_type,
        srs=srs,
    )
    # Close Connection
    conn = None
    return out_layer_name


def compare_geometry_type(
    connection_string,
    in_layer_name,
    out_layer_name,
):
    conn = ogr.Open(connection_string, 1)
    in_layer = conn.GetLayer(in_layer_name)
    out_layer = conn.GetLayer(out_layer_name)
    same = in_layer.GetGeomType() == out_layer.GetGeomType()
    conn = None
    return same


def create_field(
    connection_string,
    layer_name,
    field_name,
    field_type,
):
    ''' Creates a field for a given layer '''
    # Start Connection with read & update mode
    conn = ogr.Open(connection_string, 1)
    lyr = conn.GetLayer(layer_name)
    lyr.StartTransaction()
    field_name = ogr.FieldDefn(field_name, field_type)
    lyr.CreateField(field_name)
    lyr.CommitTransaction()
    conn = None


def get_field_index(connection_string, layer_name, attr):
    '''returns field / attribute index for a given attribute name'''
    conn = ogr.Open(connection_string)
    lyr = conn.GetLayer(layer_name)
    layer_defn = lyr.GetLayerDefn()
    for i in range(layer_defn.GetFieldCount()):
        if (layer_defn.GetFieldDefn(i).GetName() == attr):
            return i


def get_field_type(connection_string, layer_name, index):
    '''returns field / attribute type for a given attribute index'''
    conn = ogr.Open(connection_string)
    lyr = conn.GetLayer(layer_name)
    layer_defn = lyr.GetLayerDefn()
    return layer_defn.GetFieldDefn(index).GetType()


def collect_geometries(
    connection_string,
    in_layer_name,
    out_layer_name,
    attrs_indexes,
):
    # Start Connection with read & update mode
    conn = ogr.Open(connection_string, 1)
    in_layer = conn.GetLayer(in_layer_name)
    in_layer_defn = in_layer.GetLayerDefn()
    inSpatialRef = in_layer.GetSpatialRef()
    out_layer = conn.GetLayer(out_layer_name)
    outSpatialRef = out_layer.GetSpatialRef()
    out_featureDefn = out_layer.GetLayerDefn()
    # Create coordination transform object
    coordTrans = osr.CoordinateTransformation(inSpatialRef, outSpatialRef)
    # Check the same projection
    same_projection = outSpatialRef.IsSame(inSpatialRef)
    in_feature = in_layer.GetNextFeature()
    while in_feature:
        # Re-project if needed
        if same_projection:
            geom_ref = in_feature.GetGeometryRef()
        else:
            geom_ref = in_feature.GetGeometryRef()
            geom_ref.Transform(coordTrans)
        geom_wkt = geom_ref.Centroid().ExportToWkt()
        # create point geometry from in feature wkt
        geom = ogr.CreateGeometryFromWkt(geom_wkt)
        # Create out feature
        out_feature = ogr.Feature(out_featureDefn)
        out_feature.SetGeometry(geom)
        # set fields
        out_feature.SetField('layer_name', in_layer_name)
        for i in attrs_indexes:
            out_feature.SetField(
                # Field Name
                in_layer_defn.GetFieldDefn(i).GetName(),
                # Current feature field value
                in_feature[i]
            )
        # Start transactions with database
        out_layer.StartTransaction()
        out_layer.CreateFeature(out_feature)
        out_layer.CommitTransaction()
        in_feature = None
        in_feature = in_layer.GetNextFeature()
    # Close Connection
    conn = None


def execute(
    connection_string,
    in_layers,
    out_layer_name,
    attrs,
):
    # create the spatial reference, WGS84
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)
    # output geometry type
    geom_type = ogr.wkbPoint
    # Get basic info from the first layer (attrs_indices, attrs_types)
    in_layer = in_layers[0]
    # get attrs indices
    attrs_indexes = [
        get_field_index(attr=attr, layer_name=in_layer, connection_string=connection_string) 
        for attr in attrs
    ]
    # get attrs types
    attrs_types = [
        get_field_type(
            connection_string=connection_string,
            layer_name=in_layer,
            index=index
        )
        for index in attrs_indexes
    ]
    # create out layer
    out_layer_name = create_out_layer(
        out_layer_name=out_layer_name,
        connection_string=connection_string,
        geom_type=geom_type,
        srs=srs,
    )
    # TODO: make it optional
    # create default field based on layer name
    create_field(
        connection_string, out_layer_name,
        field_name='layer_name', field_type=ogr.OFTString)
    # Create fields based on the selected fields
    for field_name, field_type in zip(attrs, attrs_types):
        create_field(
            connection_string, out_layer_name,
            field_name=field_name, field_type=field_type)
    # main logic
    for layer in in_layers:
        if compare_geometry_type(
            connection_string=connection_string,
            in_layer_name=layer,
            out_layer_name=out_layer_name,
        ):
            # Current layer attrs indexes
            attrs_indexes = [
                get_field_index(attr=attr, layer_name=layer, connection_string=connection_string) 
                for attr in attrs
            ]
            collect_geometries(
                connection_string=connection_string,
                out_layer_name=out_layer_name,
                in_layer_name=layer,
                attrs_indexes=attrs_indexes,
            )
