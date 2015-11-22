title: {{ title }}
date: {{ date }}
tags:{% for tag in tags %}
  - {{tag}}{% endfor %}
---
