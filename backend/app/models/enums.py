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


class HeroLayout(str, Enum):
    GRADIENT = "GRADIENT"
    SOLID = "SOLID"
    PHOTO_COVER = "PHOTO_COVER"
    SPLIT = "SPLIT"
    TRADITIONAL = "TRADITIONAL"
    DYNAMIC = "DYNAMIC"
    KIDS = "KIDS"
    PREMIUM = "PREMIUM"


class HeadingFont(str, Enum):
    PRETENDARD = "PRETENDARD"
    SONG_MYUNG = "SONG_MYUNG"
    BLACK_HAN_SANS = "BLACK_HAN_SANS"
    GOWUN_BATANG = "GOWUN_BATANG"
    GAEGU = "GAEGU"
