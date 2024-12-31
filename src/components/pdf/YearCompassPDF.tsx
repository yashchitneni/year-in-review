import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import type { FormData } from '@/lib/store';

// Register fonts
Font.register({
  family: 'Crimson',
  src: 'https://fonts.gstatic.com/s/crimsontext/v19/wlp2gwHKFkZgtmSR3NB0oRJfbwhT.ttf',
});

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  section: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Crimson',
    marginBottom: 15,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Crimson',
    marginBottom: 10,
  },
  text: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 1.4,
  },
  label: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  response: {
    fontSize: 12,
    marginBottom: 12,
    paddingLeft: 10,
    borderLeft: '1pt solid #666',
  },
  grid: {
    flexDirection: 'row' as const,
    flexWrap: 'wrap' as const,
    gap: 10,
  },
  gridItem: {
    width: '30%',
  },
});

// Helper function to handle potentially long text
function formatLongText(text: string = '') {
  return text.split('\n').map((line, i) => (
    <Text key={i} style={styles.text}>
      {line}
    </Text>
  ));
}

interface YearCompassPDFProps {
  data: FormData;
}

export function YearCompassPDF({ data }: YearCompassPDFProps) {
  const { pastYear, yearAhead, closing } = data;

  return (
    <Document>
      {/* Past Year Section */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Year Compass 2024-2025</Text>
          <Text style={styles.subtitle}>The Past Year</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Calendar Review</Text>
          <View style={styles.response}>
            {formatLongText(pastYear.calendarReview)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Year Overview</Text>
          {Object.entries(pastYear.yearOverview).map(([key, value]) => (
            <View key={key} style={{ marginBottom: 10 }}>
              <Text style={styles.label}>{key}</Text>
              <View style={styles.response}>
                {formatLongText(value)}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>The Past Year in Three Words</Text>
          <View style={styles.grid}>
            {pastYear.threeWords.map((word, index) => (
              <View key={index} style={styles.gridItem}>
                <Text style={styles.text}>{word}</Text>
              </View>
            ))}
          </View>
        </View>
      </Page>

      {/* Year Ahead Section */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>The Year Ahead</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Dream Big</Text>
          <View style={styles.response}>
            {formatLongText(yearAhead.dreamBig)}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Year Overview</Text>
          {Object.entries(yearAhead.yearOverview).map(([key, value]) => (
            <View key={key} style={{ marginBottom: 10 }}>
              <Text style={styles.label}>{key}</Text>
              <View style={styles.response}>
                {formatLongText(value)}
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Magical Triplets</Text>
          {Object.entries(yearAhead.magicalTriplets).map(([key, values]) => (
            <View key={key} style={{ marginBottom: 10 }}>
              <Text style={styles.label}>{key}</Text>
              <View style={styles.grid}>
                {values.map((value, index) => (
                  <View key={index} style={styles.gridItem}>
                    <Text style={styles.text}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* Closing Section */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Closing Thoughts</Text>
        </View>

        {closing.sharing?.website && (
          <View style={styles.section}>
            <Text style={styles.label}>Website</Text>
            <Text style={styles.text}>{closing.sharing.website}</Text>
          </View>
        )}

        {closing.sharing?.hashtag && (
          <View style={styles.section}>
            <Text style={styles.label}>Hashtag</Text>
            <Text style={styles.text}>{closing.sharing.hashtag}</Text>
          </View>
        )}

        {closing.signature && (
          <View style={styles.section}>
            <Text style={styles.label}>Signature</Text>
            <Text style={styles.text}>[Signature]</Text>
          </View>
        )}

        {closing.date && (
          <View style={styles.section}>
            <Text style={styles.label}>Date</Text>
            <Text style={styles.text}>{closing.date}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
} 