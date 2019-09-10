from osgeo import ogr, osr

# Solution Steps::
# 1. get out layer from database, if not create it with defaults
# 2. loop through the in layers and get their features
# 3. re-project features if required
# 4. append to the out layer, and commit transaction


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
    same = in_layer.GetGeomType() == in_layer.GetGeomType()
    conn = None
    return same


def create_field(
    connection_string,
    layer_name,
    field_name,
    field_type,
):
    # Start Connection with read & update mode
    conn = ogr.Open(connection_string, 1)
    lyr = conn.GetLayer(layer_name)

    lyr.StartTransaction()

    field_name = ogr.FieldDefn(field_name, field_type)
    lyr.CreateField(field_name)

    lyr.CommitTransaction()
    conn = None


def get_field_index(connection_string, layer_name, attr):
    conn = ogr.Open(connection_string, 1)
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
):
    # Start Connection with read & update mode
    conn = ogr.Open(connection_string, 1)
    in_layer = conn.GetLayer(in_layer_name)
    out_layer = conn.GetLayer(out_layer_name)
    out_featureDefn = out_layer.GetLayerDefn()

    # Check the same projection
    same_projection = out_layer.GetSpatialRef().IsSame(in_layer.GetSpatialRef())
    if(same_projection == 1):
        # Better use GetNextFeature than feature in layer, memory efficient
        in_feature = in_layer.GetNextFeature()
        while in_feature:
            # get feature geom_wkt
            geom = in_feature.GetGeometryRef()
            geom_wkt = geom.Centroid().ExportToWkt()
            # create point geometry from in feature wkt
            point = ogr.CreateGeometryFromWkt(geom_wkt)
            # Create out feature
            out_feature = ogr.Feature(out_featureDefn)
            out_feature.SetGeometry(point)

            # TODO: Set fields from fields input
            # TODO: Make sure the field is exist
            # Set layer_name field
            out_feature.SetField('layer_name', in_layer_name)

            # Start transactions with database
            out_layer.StartTransaction()
            out_layer.CreateFeature(out_feature)
            out_layer.CommitTransaction()
            in_feature = None
            in_feature = in_layer.GetNextFeature()
        else:
            # TODO
            # re-project every feature
            # then append to out_layer
            pass

    # Close Connection
    conn = None


if __name__ == "__main__":
    databaseServer = "localhost"
    databaseName = "te_data"
    databaseUser = "postgres"
    databasePW = "123456"
    connection_string = "PG: host=%s dbname=%s user=%s password=%s" % (
        databaseServer, databaseName, databaseUser, databasePW)
    in_layers = [
        'csv_test_12',
        'cable_points10',
        'banks',
    ]
    # create the spatial reference, WGS84
    srs = osr.SpatialReference()
    srs.ImportFromEPSG(4326)
    # output geometry type
    geom_type = ogr.wkbPoint
    # Sample layers result to be sent to the end point
    results_sample = [
        {
            'layer_name': 'layer',
            'success': True,
            'warnings': 'warning messages will set here',
            'errors': 'errors will set here'
        }
    ]
    out_layer_name = 'testing_merge_layers'
    layer_exist = layer_exist(connection_string, out_layer_name)
    out_layer_name = create_out_layer(
        out_layer_name=out_layer_name,
        connection_string=connection_string,
        geom_type=geom_type,
        srs=srs,
    )
    create_field(connection_string, out_layer_name, 'layer_name', ogr.OFTString)
    for layer in in_layers:
        if compare_geometry_type(
            connection_string=connection_string,
            in_layer_name=layer,
            out_layer_name=out_layer_name,
        ):
            collect_geometries(
                connection_string=connection_string,
                out_layer_name=out_layer_name,
                in_layer_name=layer,
            )
