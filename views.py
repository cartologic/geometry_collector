import os
import re
import uuid
import json

from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.forms import ValidationError
from django.http import JsonResponse
from django.shortcuts import render

from . import APP_NAME
from .geometry_collector import check_attrs, execute
from .publishers import publish_in_geonode, publish_in_geoserver
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
        # 3. Start Generating layer
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
            json_response = {"status": False,
                                "message": "Error While Creating Out Layer In The Database! Try again or contact the administrator \n\n ogr_error:{}".format(ogr_error), }
            return JsonResponse(json_response, status=500)
        # 4. Create GeoServer
        try:
            publish_in_geoserver(out_layer_name)
        except:
            # TODO: roll back the database table here!
            json_response = {
                "status": False, "message": "Could not publish to GeoServer, Try again or contact the administrator", 'warnings': warnings}
            return JsonResponse(json_response, status=500)

        # 5. GeoNode Publish
        try:
            layer = publish_in_geonode(out_layer_name, owner=request.user)
        except:
            # TODO: roll back the delete geoserver record and db name
            json_response = {
                "status": False, "message": "Could not publish in GeoNode, Try again or contact the administrator", 'warnings': warnings}
            return JsonResponse(json_response, status=500)

        json_response = {"status": True, "message": "Line Layer Created Successfully!",
                            'warnings': warnings, "layer_name": layer.alternate}
        return JsonResponse(json_response, status=200)

    json_response = {"status": False,
                        "message": "Error While Publishing!", }
    return JsonResponse(json_response, status=500)
