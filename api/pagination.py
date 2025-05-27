# your_app/pagination.py

from rest_framework.pagination import PageNumberPagination

class TrendingPromptsPagination(PageNumberPagination):
    page_size = 10  # Number of prompts per page
    page_size_query_param = 'page_size'
    max_page_size = 50
