import { forwardRef, type ReactElement, type ReactNode } from "react";
import { getReadableTextColor } from "@/lib/dojang/brand";
import { getLayoutPreset } from "@/lib/promo/layouts";
import {
  PROMO_CARD_SIZE,
  PROMO_TYPE_LABELS,
  type PromoTemplateContent,
} from "@/types/promo-template";

const CARD_FONT =
  '"Malgun Gothic", "Apple SD Gothic Neo", "Noto Sans KR", sans-serif';

type PromoCardProps = {
  content: PromoTemplateContent;
};

function CardRoot({
  backgroundColor,
  children,
}: {
  backgroundColor: string;
  children: ReactNode;
}) {
  return (
    <div
      style={{
        position: "relative",
        boxSizing: "border-box",
        width: PROMO_CARD_SIZE,
        height: PROMO_CARD_SIZE,
        overflow: "hidden",
        backgroundColor,
        color: getReadableTextColor(backgroundColor),
        fontFamily: CARD_FONT,
      }}
    >
      {children}
    </div>
  );
}

function TypeLabel({
  content,
  color,
  align = "left",
}: {
  content: PromoTemplateContent;
  color: string;
  align?: "left" | "center";
}) {
  return (
    <p
      style={{
        margin: 0,
        color,
        fontSize: 22,
        fontWeight: 700,
        letterSpacing: "0.28em",
        textAlign: align,
      }}
    >
      {PROMO_TYPE_LABELS[content.type]}
    </p>
  );
}

function TitleBlock({
  content,
  color,
  align = "left",
  showSubtitle = true,
}: {
  content: PromoTemplateContent;
  color: string;
  align?: "left" | "center";
  showSubtitle?: boolean;
}) {
  return (
    <div style={{ textAlign: align }}>
      <h1
        style={{
          margin: 0,
          color,
          fontSize: content.titleFontSize,
          fontWeight: content.titleFontWeight,
          lineHeight: 1.15,
          letterSpacing: "-0.03em",
          whiteSpace: "pre-wrap",
          wordBreak: "keep-all",
        }}
      >
        {content.title || "제목"}
      </h1>
      {showSubtitle ? (
        <p
          style={{
            margin: "20px 0 0",
            color,
            fontSize: content.subtitleFontSize,
            fontWeight: content.subtitleFontWeight,
            lineHeight: 1.4,
            opacity: 0.92,
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {content.subtitle}
        </p>
      ) : null}
    </div>
  );
}

function BodyText({
  content,
  color,
  align = "left",
}: {
  content: PromoTemplateContent;
  color: string;
  align?: "left" | "center";
}) {
  return (
    <p
      style={{
        margin: 0,
        color,
        fontSize: content.bodyFontSize,
        fontWeight: content.bodyFontWeight,
        lineHeight: 1.6,
        textAlign: align,
        whiteSpace: "pre-wrap",
        wordBreak: "keep-all",
      }}
    >
      {content.body}
    </p>
  );
}

function DojangName({
  name,
  color,
  align = "left",
}: {
  name: string;
  color: string;
  align?: "left" | "center";
}) {
  if (!name) {
    return null;
  }

  return (
    <p
      style={{
        margin: 0,
        color,
        fontSize: 24,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textAlign: align,
      }}
    >
      {name}
    </p>
  );
}

function AwardPodium({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "88px 96px",
        }}
      >
        <TypeLabel content={content} color={accent} align="center" />
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 280,
            height: 280,
            border: `10px solid ${accent}`,
            borderRadius: "50%",
            boxShadow: `0 0 0 18px ${content.backgroundColor}, 0 0 0 22px ${accent}`,
          }}
        >
          <span style={{ color: accent, fontSize: 88, fontWeight: 800 }}>賞</span>
        </div>
        <TitleBlock content={content} color={text} align="center" />
        <div style={{ width: 120, height: 4, backgroundColor: accent }} />
        <BodyText content={content} color={text} align="center" />
        <DojangName name={content.dojangName} color={accent} align="center" />
      </div>
    </CardRoot>
  );
}

function AwardRibbon({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 150,
          padding: "0 80px",
          backgroundColor: accent,
          color: "#14120b",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: content.subtitleFontSize,
            fontWeight: content.subtitleFontWeight,
            textAlign: "center",
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {content.subtitle}
        </p>
      </div>
      <div
        style={{
          display: "flex",
          height: "calc(100% - 150px - 220px)",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 88px",
        }}
      >
        <TypeLabel content={content} color={accent} />
        <div style={{ height: 28 }} />
        <h1
          style={{
            margin: 0,
            color: text,
            fontSize: content.titleFontSize,
            fontWeight: content.titleFontWeight,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {content.title || "제목"}
        </h1>
      </div>
      <div
        style={{
          display: "flex",
          height: 220,
          flexDirection: "column",
          justifyContent: "center",
          gap: 20,
          padding: "0 88px",
          backgroundColor: "#fff8e7",
          color: "#14120b",
        }}
      >
        <BodyText content={content} color="#14120b" />
        <DojangName name={content.dojangName} color="#7f1d1d" />
      </div>
    </CardRoot>
  );
}

function AwardSplit({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div style={{ display: "flex", height: "100%" }}>
        <div
          style={{
            display: "flex",
            width: 168,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: accent,
          }}
        >
          <p
            style={{
              margin: 0,
              color: "#fff8e7",
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: "0.4em",
              writingMode: "vertical-rl",
            }}
          >
            수상
          </p>
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "96px 80px",
            color: "#1c1917",
          }}
        >
          <TypeLabel content={content} color={accent} />
          <TitleBlock content={content} color="#1c1917" />
          <div>
            <div
              style={{
                width: 72,
                height: 6,
                marginBottom: 28,
                backgroundColor: accent,
              }}
            />
            <BodyText content={content} color="#44403c" />
          </div>
          <DojangName name={content.dojangName} color={accent} />
        </div>
      </div>
    </CardRoot>
  );
}

function AwardStamp({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);
  const frame = 48;

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          position: "absolute",
          inset: frame,
          border: `2px solid ${accent}`,
        }}
      />
      {(["tl", "tr", "bl", "br"] as const).map((corner) => (
        <span
          key={corner}
          style={{
            position: "absolute",
            width: 36,
            height: 36,
            borderColor: accent,
            borderStyle: "solid",
            borderWidth: 0,
            ...(corner === "tl"
              ? { top: 28, left: 28, borderTopWidth: 6, borderLeftWidth: 6 }
              : corner === "tr"
                ? { top: 28, right: 28, borderTopWidth: 6, borderRightWidth: 6 }
                : corner === "bl"
                  ? {
                      bottom: 28,
                      left: 28,
                      borderBottomWidth: 6,
                      borderLeftWidth: 6,
                    }
                  : {
                      bottom: 28,
                      right: 28,
                      borderBottomWidth: 6,
                      borderRightWidth: 6,
                    }),
          }}
        />
      ))}
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          padding: 120,
          textAlign: "center",
        }}
      >
        <TypeLabel content={content} color={accent} align="center" />
        <TitleBlock content={content} color={text} align="center" />
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 160,
            height: 160,
            border: `4px solid ${accent}`,
            borderRadius: "50%",
            transform: "rotate(-12deg)",
          }}
        >
          <span style={{ color: accent, fontSize: 36, fontWeight: 800 }}>PUMSAE</span>
        </div>
        <BodyText content={content} color={text} align="center" />
        <DojangName name={content.dojangName} color={accent} align="center" />
      </div>
    </CardRoot>
  );
}

const BELT_COLORS = ["#f8fafc", "#facc15", "#22c55e", "#2563eb", "#dc2626", "#111111"];

function BeltStripe({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div style={{ display: "flex", height: 56 }}>
        {BELT_COLORS.map((color) => (
          <div key={color} style={{ flex: 1, backgroundColor: color }} />
        ))}
      </div>
      <div
        style={{
          display: "flex",
          height: "calc(100% - 56px - 72px)",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 40,
          padding: "0 96px",
        }}
      >
        <TypeLabel content={content} color={accent} align="center" />
        <TitleBlock content={content} color={text} align="center" />
        <BodyText content={content} color={text} align="center" />
        <DojangName name={content.dojangName} color={accent} align="center" />
      </div>
      <div style={{ height: 72, backgroundColor: "#111111" }}>
        <div style={{ height: 14, backgroundColor: accent }} />
      </div>
    </CardRoot>
  );
}

function BeltColumn({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div style={{ display: "flex", height: "100%" }}>
        <div style={{ display: "flex", width: 88, flexDirection: "column" }}>
          {BELT_COLORS.map((color) => (
            <div key={color} style={{ flex: 1, backgroundColor: color }} />
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "96px 80px",
          }}
        >
          <TypeLabel content={content} color={accent} />
          <TitleBlock content={content} color={text} />
          <BodyText content={content} color={text} />
          <DojangName name={content.dojangName} color={accent} />
        </div>
      </div>
    </CardRoot>
  );
}

function BeltSeal({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 36,
          padding: 100,
        }}
      >
        <div
          style={{
            display: "grid",
            placeItems: "center",
            width: 220,
            height: 220,
            border: `8px solid ${accent}`,
            borderRadius: "50%",
          }}
        >
          <span style={{ color: accent, fontSize: 64, fontWeight: 800 }}>승급</span>
        </div>
        <TitleBlock content={content} color={text} align="center" />
        <BodyText content={content} color={text} align="center" />
        <DojangName name={content.dojangName} color={accent} align="center" />
      </div>
    </CardRoot>
  );
}

function BeltStage({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at 50% 28%, rgba(255,255,255,0.16), transparent 42%)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "100px 96px",
        }}
      >
        <TypeLabel content={content} color={accent} />
        <div>
          <TitleBlock content={content} color={text} />
          <div
            style={{
              width: 140,
              height: 8,
              marginTop: 36,
              backgroundColor: accent,
            }}
          />
        </div>
        <div>
          <BodyText content={content} color={text} />
          <div style={{ height: 28 }} />
          <DojangName name={content.dojangName} color={accent} />
        </div>
      </div>
    </CardRoot>
  );
}

function RecruitPoster({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <p
        style={{
          position: "absolute",
          top: 220,
          left: 40,
          margin: 0,
          color: accent,
          fontSize: 280,
          fontWeight: 800,
          letterSpacing: "-0.06em",
          opacity: 0.12,
          lineHeight: 1,
        }}
      >
        모집
      </p>
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "100px 88px",
        }}
      >
        <TypeLabel content={content} color={accent} />
        <TitleBlock content={content} color={text} />
        <div>
          <BodyText content={content} color={text} />
          <div style={{ height: 28 }} />
          <DojangName name={content.dojangName} color={accent} />
        </div>
      </div>
    </CardRoot>
  );
}

function RecruitInfo({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          display: "flex",
          height: 280,
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "0 80px 48px",
          backgroundColor: accent,
          color: "#fff7ed",
        }}
      >
        <TypeLabel content={content} color="#fed7aa" />
        <h1
          style={{
            margin: "16px 0 0",
            fontSize: content.titleFontSize,
            fontWeight: content.titleFontWeight,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {content.title || "제목"}
        </h1>
      </div>
      <div style={{ padding: "56px 80px 80px" }}>
        <div
          style={{
            padding: "36px 40px",
            backgroundColor: "#ffffff",
            borderRadius: 28,
            boxShadow: "0 16px 40px rgba(154, 52, 18, 0.08)",
          }}
        >
          <p
            style={{
              margin: 0,
              color: accent,
              fontSize: content.subtitleFontSize,
              fontWeight: content.subtitleFontWeight,
              whiteSpace: "pre-wrap",
              wordBreak: "keep-all",
            }}
          >
            {content.subtitle}
          </p>
        </div>
        <div style={{ height: 40 }} />
        <BodyText content={content} color="#7c2d12" />
        <div style={{ height: 36 }} />
        <DojangName name={content.dojangName} color={accent} />
      </div>
    </CardRoot>
  );
}

function RecruitSlash({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          position: "absolute",
          top: -120,
          right: -180,
          width: 620,
          height: 1320,
          backgroundColor: accent,
          transform: "rotate(22deg)",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "100px 88px",
        }}
      >
        <TypeLabel content={content} color={accent} />
        <TitleBlock content={content} color={text} />
        <div>
          <BodyText content={content} color={text} />
          <div style={{ height: 28 }} />
          <DojangName name={content.dojangName} color={accent} />
        </div>
      </div>
    </CardRoot>
  );
}

function RecruitGrid({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "96px 88px",
          color: "#1c1917",
        }}
      >
        <TypeLabel content={content} color={accent} />
        <TitleBlock content={content} color="#1c1917" />
        <div style={{ height: 2, backgroundColor: accent }} />
        <p
          style={{
            margin: 0,
            color: accent,
            fontSize: content.subtitleFontSize,
            fontWeight: content.subtitleFontWeight,
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {content.subtitle}
        </p>
        <div style={{ height: 2, backgroundColor: "#fecaca" }} />
        <BodyText content={content} color="#44403c" />
        <DojangName name={content.dojangName} color={accent} />
      </div>
    </CardRoot>
  );
}

function EventFest({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      {[40, 200, 860, 980].map((top, index) => (
        <span
          key={top}
          style={{
            position: "absolute",
            top,
            left: index % 2 === 0 ? 48 : "auto",
            right: index % 2 === 0 ? "auto" : 56,
            width: 18,
            height: 18,
            backgroundColor: accent,
            borderRadius: "50%",
          }}
        />
      ))}
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "100px 88px",
        }}
      >
        <TypeLabel content={content} color={accent} />
        <TitleBlock content={content} color={text} showSubtitle={false} />
        <div
          style={{
            padding: "28px 36px",
            border: `3px solid ${accent}`,
            color: accent,
            fontSize: content.subtitleFontSize,
            fontWeight: content.subtitleFontWeight,
            textAlign: "center",
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {content.subtitle}
        </div>
        <BodyText content={content} color={text} />
        <DojangName name={content.dojangName} color={accent} />
      </div>
    </CardRoot>
  );
}

function EventInvite({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          position: "absolute",
          inset: 40,
          border: `3px solid ${accent}`,
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 52,
          border: `1px solid ${accent}`,
        }}
      />
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 32,
          padding: 120,
          color: "#1c1917",
          textAlign: "center",
        }}
      >
        <TypeLabel content={content} color={accent} align="center" />
        <TitleBlock content={content} color="#1c1917" align="center" />
        <div style={{ width: 80, height: 2, backgroundColor: accent }} />
        <BodyText content={content} color="#57534e" align="center" />
        <DojangName name={content.dojangName} color={accent} align="center" />
      </div>
    </CardRoot>
  );
}

function EventBold({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          display: "flex",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "88px 80px",
        }}
      >
        <TypeLabel content={content} color={accent} />
        <h1
          style={{
            margin: 0,
            color: text,
            fontSize: content.titleFontSize,
            fontWeight: content.titleFontWeight,
            lineHeight: 1.05,
            letterSpacing: "-0.04em",
            whiteSpace: "pre-wrap",
            wordBreak: "keep-all",
          }}
        >
          {content.title || "제목"}
        </h1>
        <div>
          <p
            style={{
              margin: 0,
              color: accent,
              fontSize: content.subtitleFontSize,
              fontWeight: content.subtitleFontWeight,
              whiteSpace: "pre-wrap",
              wordBreak: "keep-all",
            }}
          >
            {content.subtitle}
          </p>
          <div style={{ height: 24 }} />
          <BodyText content={content} color={text} />
          <div style={{ height: 28 }} />
          <DojangName name={content.dojangName} color={accent} />
        </div>
      </div>
    </CardRoot>
  );
}

function EventTicket({
  content,
  accent,
}: {
  content: PromoTemplateContent;
  accent: string;
}) {
  const text = getReadableTextColor(content.backgroundColor);

  return (
    <CardRoot backgroundColor={content.backgroundColor}>
      <div
        style={{
          position: "absolute",
          top: 690,
          left: -28,
          width: 56,
          height: 56,
          backgroundColor: "#f4f4f5",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: 690,
          right: -28,
          width: 56,
          height: 56,
          backgroundColor: "#f4f4f5",
          borderRadius: "50%",
        }}
      />
      <div
        style={{
          display: "flex",
          height: 720,
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "88px 88px 48px",
        }}
      >
        <TypeLabel content={content} color={accent} />
        <TitleBlock content={content} color={text} />
      </div>
      <div
        style={{
          margin: "0 56px",
          borderTop: `4px dashed ${accent}`,
        }}
      />
      <div style={{ padding: "40px 88px 0" }}>
        <BodyText content={content} color={text} />
        <div style={{ height: 24 }} />
        <DojangName name={content.dojangName} color={accent} />
      </div>
    </CardRoot>
  );
}

const LAYOUT_VIEWS: Record<
  string,
  (props: { content: PromoTemplateContent; accent: string }) => ReactElement
> = {
  "award-podium": AwardPodium,
  "award-ribbon": AwardRibbon,
  "award-split": AwardSplit,
  "award-stamp": AwardStamp,
  "belt-stripe": BeltStripe,
  "belt-column": BeltColumn,
  "belt-seal": BeltSeal,
  "belt-stage": BeltStage,
  "recruit-poster": RecruitPoster,
  "recruit-info": RecruitInfo,
  "recruit-slash": RecruitSlash,
  "recruit-grid": RecruitGrid,
  "event-fest": EventFest,
  "event-invite": EventInvite,
  "event-bold": EventBold,
  "event-ticket": EventTicket,
};

export const PromoCard = forwardRef<HTMLDivElement, PromoCardProps>(
  function PromoCard({ content }, ref) {
    const preset = getLayoutPreset(content.layoutId);
    const View = LAYOUT_VIEWS[content.layoutId] ?? AwardPodium;

    return (
      <div
        ref={ref}
        style={{ width: PROMO_CARD_SIZE, height: PROMO_CARD_SIZE }}
      >
        <View content={content} accent={preset?.accentColor ?? "#d4af37"} />
      </div>
    );
  },
);
