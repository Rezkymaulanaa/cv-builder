import { Document, Font, Image, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { dictionaries, formatMonth, formatRange } from "../cv/i18n";
import { summaryInHeader } from "../cv/layout";
import type { CvData, CvStyle, SectionId } from "../cv/schema";

// Hyphenating at line ends would split keywords that ATS parsers search for.
Font.registerHyphenationCallback((word) => [word]);

const SPACING = {
  compact: { page: 32, section: 8, entry: 5, font: 9.5, line: 1.3 },
  normal: { page: 42, section: 12, entry: 7, font: 10.5, line: 1.35 },
  relaxed: { page: 50, section: 16, entry: 9, font: 10.5, line: 1.45 },
};

function createStyles(style: CvStyle) {
  const spacing = SPACING[style.spacing];
  const heading = {
    rule: { borderBottomWidth: 0.75, borderBottomColor: style.accent, paddingBottom: 2, textTransform: "uppercase" as const },
    caps: { textTransform: "uppercase" as const, letterSpacing: 0.5 },
    plain: {},
  }[style.headingStyle];

  return StyleSheet.create({
    page: {
      padding: spacing.page,
      fontFamily: style.font,
      fontSize: spacing.font,
      lineHeight: spacing.line,
      color: "#111827",
    },
    headerRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: spacing.section },
    header: { flex: 1, textAlign: style.headerAlign },
    // Keeps the 4:5 ratio: 2.8 x 3.5 cm on the page.
    photo: { width: 80, height: 100, marginRight: 14, objectFit: "cover" },
    name: { fontSize: spacing.font * 2, fontWeight: "bold", color: style.accent, lineHeight: 1.2 },
    headline: { fontSize: spacing.font + 1.5 },
    contact: { marginTop: 2, color: "#4b5563" },
    headerSummary: { marginTop: spacing.entry },
    section: { marginBottom: spacing.section },
    heading: {
      fontSize: spacing.font + 1.5,
      fontWeight: "bold",
      color: style.accent,
      marginBottom: spacing.entry - 2,
      ...heading,
    },
    entry: { marginBottom: spacing.entry },
    entryHead: { flexDirection: "row", justifyContent: "space-between" },
    entryTitle: { fontWeight: "bold", flexShrink: 1, paddingRight: 12 },
    entryLocation: { color: "#4b5563" },
    entryNote: { color: "#4b5563" },
    label: { fontWeight: "bold" },
    entryDate: { flexShrink: 0 },
    bullet: { flexDirection: "row", paddingLeft: 2 },
    subBullet: { paddingLeft: 12 },
    bulletMark: { width: 10 },
    bulletText: { flex: 1 },
  });
}

type Styles = ReturnType<typeof createStyles>;

const lines = (value: string) =>
  value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

const join = (parts: string[], separator: string) => parts.map((part) => part.trim()).filter(Boolean).join(separator);

function Bullets({ value, styles, always = false }: { value: string; styles: Styles; always?: boolean }) {
  const items = lines(value);
  if (items.length === 1 && !always) return <Text>{items[0]}</Text>;
  return items.map((item, index) => (
    <View key={index} style={styles.bullet}>
      <Text style={styles.bulletMark}>•</Text>
      <Text style={styles.bulletText}>{item}</Text>
    </View>
  ));
}

function Section({ title, styles, children }: { title: string; styles: Styles; children: ReactNode }) {
  return (
    <View style={styles.section}>
      {/* Keeps a heading from being stranded at the bottom of a page. */}
      <Text style={styles.heading} minPresenceAhead={36}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function Entry({
  title,
  location,
  date,
  detail,
  note,
  subtitle,
  description,
  bullets = false,
  styles,
}: {
  title: string;
  // Shown after the title in grey, e.g. "PT Contoh - Jakarta".
  location?: string;
  date?: string;
  // A line under the title, such as the role or degree.
  detail?: string;
  // A grey line under the detail, such as what an organization is.
  note?: string;
  subtitle?: string;
  description?: string;
  // Always list the description as bullets, even a single line.
  bullets?: boolean;
  styles: Styles;
}) {
  return (
    <View style={styles.entry}>
      <View style={styles.entryHead}>
        <Text style={styles.entryTitle}>
          {title}
          {location?.trim() ? <Text style={styles.entryLocation}> - {location.trim()}</Text> : null}
        </Text>
        {date ? <Text style={styles.entryDate}>{date}</Text> : null}
      </View>
      {detail ? <Text>{detail}</Text> : null}
      {note?.trim() ? <Text style={styles.entryNote}>{note.trim()}</Text> : null}
      {subtitle ? <Text>{subtitle}</Text> : null}
      {description ? <Bullets value={description} styles={styles} always={bullets} /> : null}
    </View>
  );
}

function renderSection(id: SectionId, cv: CvData, styles: Styles): ReactNode {
  const { content, language } = cv;
  const labels = dictionaries[language].sections;

  switch (id) {
    case "summary":
      return content.summary.trim() && !summaryInHeader(cv) ? (
        <Section key={id} title={labels.summary} styles={styles}>
          <Text>{content.summary.trim()}</Text>
        </Section>
      ) : null;
    case "experience": {
      const items = content.experience.filter((item) => item.role.trim() || item.company.trim());
      return items.length ? (
        <Section key={id} title={labels.experience} styles={styles}>
          {items.map((item, index) => (
            <Entry
              key={index}
              title={item.company || item.role}
              location={item.location}
              date={formatRange(item.startDate, item.endDate, item.current, language)}
              detail={item.company ? item.role : ""}
              description={item.description}
              bullets
              styles={styles}
            />
          ))}
        </Section>
      ) : null;
    }
    case "organizations": {
      const items = content.organizations.filter((item) => item.organization.trim() || item.role.trim());
      return items.length ? (
        <Section key={id} title={labels.organizations} styles={styles}>
          {items.map((item, index) => (
            <Entry
              key={index}
              title={item.organization || item.role}
              location={item.location}
              date={formatRange(item.startDate, item.endDate, item.current, language)}
              detail={item.organization ? item.role : ""}
              note={item.organizationDescription}
              description={item.description}
              bullets
              styles={styles}
            />
          ))}
        </Section>
      ) : null;
    }
    case "education": {
      const items = content.education.filter((item) => item.degree.trim() || item.school.trim() || item.level);
      return items.length ? (
        <Section key={id} title={labels.education} styles={styles}>
          {items.map((item, index) => {
            // e.g. "Sarjana Sistem Informasi" and "3.76/4.00"
            const degree = join([item.level ? dictionaries[language].educationLevels[item.level] : "", item.degree], " ");
            const gpa = item.gpa.trim() ? join([item.gpa, item.gpaMax], "/") : "";
            return (
              <Entry
                key={index}
                title={item.school || degree}
                location={item.location}
                date={formatRange(item.startDate, item.endDate, item.current, language)}
                detail={join([item.school ? degree : "", gpa], ", ")}
                description={item.description}
                bullets
                styles={styles}
              />
            );
          })}
        </Section>
      ) : null;
    }
    case "skills": {
      const items = content.skills.filter((item) => item.category.trim() || item.description.trim());
      return items.length ? (
        <Section key={id} title={labels.skills} styles={styles}>
          {items.map((item, index) => {
            // e.g. "Hard Skills: Excel, SQL" or "Proyek (2024): ..."
            const label = join([item.category, item.year.trim() ? `(${item.year.trim()})` : ""], " ");
            if (item.format === "list") {
              const points = lines(item.description);
              // Without a category there is nothing to nest under.
              if (!label) return <Bullets key={index} value={item.description} styles={styles} always />;
              return (
                <View key={index}>
                  <View style={styles.bullet}>
                    <Text style={styles.bulletMark}>•</Text>
                    <Text style={[styles.bulletText, styles.label]}>{points.length ? `${label}:` : label}</Text>
                  </View>
                  {points.map((point, pointIndex) => (
                    <View key={pointIndex} style={[styles.bullet, styles.subBullet]}>
                      <Text style={styles.bulletMark}>–</Text>
                      <Text style={styles.bulletText}>{point}</Text>
                    </View>
                  ))}
                </View>
              );
            }
            const description = item.description.trim();
            return (
              <View key={index} style={styles.bullet}>
                <Text style={styles.bulletMark}>•</Text>
                <Text style={styles.bulletText}>
                  {label ? <Text style={styles.label}>{description ? `${label}: ` : label}</Text> : null}
                  {description}
                </Text>
              </View>
            );
          })}
        </Section>
      ) : null;
    }
    case "projects": {
      const items = content.projects.filter((item) => item.name.trim());
      return items.length ? (
        <Section key={id} title={labels.projects} styles={styles}>
          {items.map((item, index) => (
            <Entry key={index} title={item.name} subtitle={item.url} description={item.description} styles={styles} />
          ))}
        </Section>
      ) : null;
    }
    case "certifications": {
      const items = content.certifications.filter((item) => item.name.trim());
      return items.length ? (
        <Section key={id} title={labels.certifications} styles={styles}>
          {items.map((item, index) => (
            <Entry
              key={index}
              title={item.name}
              date={formatMonth(item.date, language)}
              subtitle={item.issuer}
              styles={styles}
            />
          ))}
        </Section>
      ) : null;
    }
    case "languages": {
      const items = content.languages.filter((item) => item.name.trim());
      return items.length ? (
        <Section key={id} title={labels.languages} styles={styles}>
          <Text>{items.map((item) => join([item.name, item.level], " - ")).join(", ")}</Text>
        </Section>
      ) : null;
    }
    case "custom":
      return content.customSections
        .filter((item) => item.title.trim())
        .map((item, index) => (
          <Section key={`${id}-${index}`} title={item.title} styles={styles}>
            <Bullets value={item.description} styles={styles} />
          </Section>
        ));
  }
}

export function CvDocument({ cv }: { cv: CvData }) {
  const styles = createStyles(cv.style);
  const { personal, photo } = cv.content;
  const contact = join(
    [personal.email, personal.phone, personal.linkedin, personal.website, personal.location, personal.country],
    " | ",
  );

  return (
    <Document title={personal.fullName ? `CV - ${personal.fullName}` : "CV"} author={personal.fullName} language={cv.language}>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- react-pdf images take no alt text */}
          {photo ? <Image style={styles.photo} src={photo.image} /> : null}
          <View style={styles.header}>
            {personal.fullName ? <Text style={styles.name}>{personal.fullName}</Text> : null}
            {personal.headline ? <Text style={styles.headline}>{personal.headline}</Text> : null}
            {contact ? <Text style={styles.contact}>{contact}</Text> : null}
            {summaryInHeader(cv) && cv.content.summary.trim() ? (
              <Text style={styles.headerSummary}>{cv.content.summary.trim()}</Text>
            ) : null}
          </View>
        </View>
        {cv.style.sectionOrder.map((id) => renderSection(id, cv, styles))}
      </Page>
    </Document>
  );
}
