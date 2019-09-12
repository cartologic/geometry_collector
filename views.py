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
from .geometry_collector import check_attrs
from .utils import create_connection_string


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
