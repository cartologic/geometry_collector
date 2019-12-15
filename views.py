import json

from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.shortcuts import render
from geonode.layers.models import Layer

from . import APP_NAME
from .geometry_collector import check_attrs, delete_layer, execute
from .publishers import publish_in_geonode, publish_in_geoserver, cascade_delete_layer
from .utils import create_connection_string, table_exist


@login_required
def index(request):
    return render(request, template_name="%s/index.html" % APP_NAME,
                  context={'message': 'Hello from %s' % APP_NAME, 'app_name': APP_NAME})


@login_required
def check_attributes(request):
    if request.method == 'POST':
        attrs = [str(f) for f in json.loads(request.POST['selected_attrs'])]
        layers = [str(f) for f in json.loads(request.POST['selected_layers'])]
        connection_string = create_connection_string()
        result = check_attrs(
            connection_string=connection_string,
            attrs=attrs,
            layers=layers,
        )
        if result == {}:
            return JsonResponse({}, status=200)
        else:
            json_response = {
                "message": "Error: some layers don't contain the selected attributes!",
                "result": result
            }
            return JsonResponse(json_response, status=500)


@login_required
def generate(request):
    warnings = ''
    if request.method == 'POST':
        # 1. get the data
        layers = [str(f) for f in json.loads(request.POST['selected_layers'])]
        attrs = [str(f) for f in json.loads(request.POST['selected_attrs'])]
        out_layer_name = str(request.POST['out_layer_name'])
        # 2. Check table exist
        if table_exist(out_layer_name):
            json_response = {"status": False,
                             "message": "Layer Already Exists!, Try again with different layer name, If you don't see the existing layer in the layer list, Please contact the administrator", }
            return JsonResponse(json_response, status=500)
        # 3. Start Generating layer using gdal
        connection_string = create_connection_string()
        try:
            execute(
                connection_string=connection_string,
                in_layers=layers,
                out_layer_name=out_layer_name,
                attrs=attrs,
            )
        except Exception as e:
            # TODO: roll back delete layer(table) from database if created!
            ogr_error = 'Error while creating out Layer: {}'.format(e)
            json_response = {
                "status": False,
                "message": "Error while creating layer in database! Try again or contact the administrator, ogr_error:{}".format(ogr_error),
            }
            delete_layer(connection_string, out_layer_name)
            return JsonResponse(json_response, status=500)
        # 4. Create GeoServer
        gs_response = publish_in_geoserver(out_layer_name)
        if gs_response.status_code != 201:
            if gs_response.status_code == 500:
                # status code 500:
                # layer exist in geoserver datastore and does not exist in database
                # hence the database check is done in step 2
                # cascade delete is a method deletes layer from geoserver and database
                cascade_delete_layer(str(out_layer_name))
            # delete layer from database as well
            delete_layer(connection_string, str(out_layer_name))
            json_response = {
                "status": False, "message": "Could not publish to GeoServer, Error Response Code:{}".format(
                    gs_response.status_code), 'warnings': warnings}
            return JsonResponse(json_response, status=500)

        # 5. GeoNode Publish
        try:
            layer = publish_in_geonode(out_layer_name, owner=request.user)
        except Exception as e:
            # Roll back and delete the created table in database, geoserver and geonode if exist
            delete_layer(connection_string, str(out_layer_name))
            cascade_delete_layer(str(out_layer_name))
            try:
                Layer.objects.get(name=str(out_layer_name)).delete()
            finally:
                print('Layer {} could not be deleted or does not already exist'.format(out_layer_name))
            print('Error while publishing {} in geonode: {}'.format(out_layer_name, e.message))
            json_response = {
                "status": False, "message": "Could not publish in GeoNode", 'warnings': warnings}
            return JsonResponse(json_response, status=400)

        json_response = {"status": True, "message": "Line Layer Created Successfully!",
                         'warnings': warnings, "layer_name": layer.alternate}
        return JsonResponse(json_response, status=200)

    json_response = {"status": False,
                     "message": "Error While Publishing!", }
    return JsonResponse(json_response, status=500)
