---
sidebar_position: 4
---

# Creating Resources

The `blacksmith make:resource` command is the primary way to add new features to your project. This guide walks through the full workflow of creating and customizing a resource.

## Step 1: Generate the Resource

```bash
blacksmith make:resource Product
```

This creates all the backend and frontend files and wires them together. See the [make:resource command](/docs/commands/make-resource) for the complete list of generated files.

## Step 2: Define Your Model

Edit the generated model to add your fields:

```python
# backend/apps/products/models.py
from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100, blank=True)
    in_stock = models.BooleanField(default=True)
    image_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
```

## Step 3: Update the Serializer

Match the serializer to your model fields:

```python
# backend/apps/products/serializers.py
from rest_framework import serializers
from .models import Product


class ProductSerializer(serializers.ModelSerializer):
    class Meta:
        model = Product
        fields = [
            'id',
            'name',
            'description',
            'price',
            'category',
            'in_stock',
            'image_url',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
```

## Step 4: Run Migrations

```bash
blacksmith backend makemigrations products
blacksmith backend migrate
```

## Step 5: Sync Types

```bash
blacksmith sync
```

This regenerates the TypeScript types. Your frontend now has:

```typescript
// Auto-generated in types.gen.ts
interface Product {
  id: number;
  name: string;
  description: string;
  price: string;  // DecimalField maps to string
  category: string;
  in_stock: boolean;
  image_url: string;
  created_at: string;
  updated_at: string;
}
```

## Step 6: Customize the Frontend

Update the generated pages and forms to use your new fields. The generated React Query hooks are ready to use:

```typescript
import {
  useProductsList,
  useProductsCreate,
  useProductsRetrieve,
  useProductsUpdate,
  useProductsDestroy,
} from '@/api/generated/@tanstack/react-query.gen';

function ProductListPage() {
  const { data, isLoading } = useProductsList();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(product => (
        <div key={product.id}>
          <h3>{product.name}</h3>
          <p>${product.price}</p>
          <span>{product.in_stock ? 'In Stock' : 'Out of Stock'}</span>
        </div>
      ))}
    </div>
  );
}
```

## Step 7: Customize the Viewset

Add filtering, search, or custom actions to the viewset:

```python
# backend/apps/products/views.py
from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from .models import Product
from .serializers import ProductSerializer


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    filterset_fields = ['category', 'in_stock']
    search_fields = ['name', 'description']
    ordering_fields = ['price', 'created_at', 'name']
```

## Adding Relationships

When your resource relates to other models:

```python
# Models
class Category(models.Model):
    name = models.CharField(max_length=100)

class Product(models.Model):
    category = models.ForeignKey(Category, on_delete=models.CASCADE, related_name='products')
    # ... other fields
```

Update the serializer to include the relation:

```python
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id', 'name', 'category', 'category_name', ...]
```

Run `blacksmith sync` to update the frontend types with the new fields.

## Tips

- Always run `blacksmith sync` after changing serializers or viewsets
- Use `blacksmith dev` during development for automatic sync
- Check generated types in `frontend/src/api/generated/types.gen.ts` to verify the sync
- Use the Django admin (`/admin/`) for quick data entry during development
