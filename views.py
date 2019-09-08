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


@login_required
def index(request):
    return render(request, template_name="%s/index.html" % APP_NAME,
                  context={'message': 'Hello from %s' % APP_NAME, 'app_name': APP_NAME})
