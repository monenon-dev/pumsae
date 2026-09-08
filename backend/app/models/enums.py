from enum import Enum


class UserRole(str, Enum):
    OWNER = "OWNER"
    INSTRUCTOR = "INSTRUCTOR"


class PromoTemplateType(str, Enum):
    AWARD = "AWARD"
    BELT_UP = "BELT_UP"
    RECRUIT = "RECRUIT"
    EVENT = "EVENT"


class DesiredClass(str, Enum):
    KIDS = "KIDS"
    ELEMENTARY = "ELEMENTARY"
    MIDDLE_HIGH = "MIDDLE_HIGH"
    ADULT = "ADULT"


class TrialRequestStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    DECLINED = "DECLINED"
