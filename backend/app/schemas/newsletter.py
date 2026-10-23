from pydantic import AliasChoices, BaseModel, ConfigDict, EmailStr, Field, field_validator


class NewsletterSubscriptionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr = Field(validation_alias=AliasChoices("email", "correo"))
    consent: bool = Field(validation_alias=AliasChoices("consent", "consentimiento"))

    @field_validator("consent")
    @classmethod
    def consent_required(cls, value: bool) -> bool:
        if value is not True:
            raise ValueError("Debes aceptar recibir el boletín.")
        return value


class NewsletterSubscriptionResponse(BaseModel):
    message: str
    estado: str = "PENDIENTE"
