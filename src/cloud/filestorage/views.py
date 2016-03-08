from django.views.generic import View
from django.http import HttpResponse
from django.core import serializers
from filestorage.models import *

class FilesAPIView(View):
    def get(self, request):
        return HttpResponse(status=200, content=serializers.serialize('json', CloudSystemFile.objects.all()), content_type="application/json")

    def post(self, request):
        pass

    def put(self, request):
        pass

    def delete(self, request):
        pass

class FoldersAPIView(View):
    def get(self, request):
        return HttpResponse(status=200, content=serializers.serialize('json', CloudSystemFolder.objects.all()), content_type="application/json")

    def post(self, request):
        pass

    def put(self, request):
        pass

    def delete(self, request):
        pass
