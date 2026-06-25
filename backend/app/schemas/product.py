from pydantic import BaseModel, ConfigDict, Field


class ProductListItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    product_name: str
    deleted_at: str = ""


class ProductDetailPayload(BaseModel):
    name: str
    product_description: str
    crop_name: str
    dosage: str
    gazette_notification: str
    dated: str
    marketing_license_number: str
    authorization_number: str
    manufacturing_license_number: str
    manufactured_and_marketed_by: str
    created_at: str


class ProductIngredientItem(BaseModel):
    ingredient_name: str
    content: str
    created_at: str


class ProductIngredientInput(BaseModel):
    ingredient_name: str = ""
    content: str = ""


class ProductDetailInput(BaseModel):
    name: str = ""
    product_description: str = ""
    crop_name: str = ""
    dosage: str = ""
    gazette_notification: str = ""
    dated: str = ""
    marketing_license_number: str = ""
    authorization_number: str = ""
    manufacturing_license_number: str = ""
    manufactured_and_marketed_by: str = ""


class ProductUpsertRequest(BaseModel):
    product_name: str = Field(min_length=1, max_length=120)
    details: ProductDetailInput
    ingredients: list[ProductIngredientInput] = Field(default_factory=list)


class ProductQRCode(BaseModel):
    qr_payload: str
    format: str


class ProductDetailResponse(BaseModel):
    id: int
    product_name: str
    created_at: str
    updated_at: str
    details: ProductDetailPayload
    ingredients: list[ProductIngredientItem]
    qr: ProductQRCode
