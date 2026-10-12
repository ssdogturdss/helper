import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';

interface ChartData {
  labels: string[];
  values: number[];
}

export default function App() {
  const [input, setInput] = useState('');
  const [chartData, setChartData] = useState<ChartData | null>(null);
  const [document, setDocument] = useState('');
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'line'>('bar');

  const processInput = () => {
    if (!input.trim()) {
      Alert.alert('Error', 'Please enter some information');
      return;
    }

    // Parse messy input into structured data
    const lines = input.trim().split('\n').filter(l => l.trim());
    const labels: string[] = [];
    const values: number[] = [];
    let docText = '';

    lines.forEach(line => {
      // Try to extract key-value pairs like "Sales: 1200" or "Q1 500"
      const match = line.match(/([A-Za-z0-9\s]+)[:\-]\s*(\d+)/);
      if (match) {
        labels.push(match[1].trim());
        values.push(parseInt(match[2], 10));
      } else {
        docText += line + '\n';
      }
    });

    if (labels.length > 0 && values.length > 0) {
      setChartData({ labels, values });
      setDocument(docText || 'Professional Report Generated');
    } else {
      // Fallback: create simple bar representation
      setDocument(input);
      setChartData(null);
    }
  };

  const reset = () => {
    setInput('');
    setChartData(null);
    setDocument('');
  };

  const renderBarChart = (data: ChartData) => {
    const maxVal = Math.max(...data.values);
    return data.labels.map((label, index) => {
      const value = data.values[index];
      const barWidth = maxVal > 0 ? (value / maxVal) * 100 : 0;
      return (
        <View key={index} style={styles.barRow}>
          <Text style={styles.barLabel}>{label}</Text>
          <View style={styles.barContainer}>
            <View style={[styles.bar, { width: `${barWidth}%` }]} />
          </View>
          <Text style={styles.barValue}>{value}</Text>
        </View>
      );
    });
  };

  const renderPieChart = (data: ChartData) => {
    const total = data.values.reduce((a, b) => a + b, 0);
    const colors = ['#0ea5e9', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
    return data.labels.map((label, index) => {
      const value = data.values[index];
      const pct = total > 0 ? Math.round((value / total) * 100) : 0;
      return (
        <View key={index} style={styles.pieRow}>
          <View style={[styles.pieDot, { backgroundColor: colors[index % colors.length] }]} />
          <Text style={styles.pieLabel}>{label}</Text>
          <Text style={styles.pieValue}>{value} ({pct}%)</Text>
        </View>
      );
    });
  };

  const renderLineChart = (data: ChartData) => {
    const maxVal = Math.max(...data.values);
    const minVal = Math.min(...data.values);
    const range = maxVal - minVal || 1;
    const width = 280;
    const height = 160;
    const padding = 40;

    const points = data.values.map((val, i) => {
      const x = padding + (i * (width - padding * 2)) / (data.values.length - 1 || 1);
      const y = padding + ((maxVal - val) / range) * (height - padding * 2);
      return { x, y, val, label: data.labels[i] };
    });

    return (
      <View style={{ height, width, alignSelf: 'center', position: 'relative' }}>
        {/* Axes */}
        <View style={[styles.lineAxis, { left: padding, top: padding, height: height - padding * 2 }]} />
        <View style={[styles.lineAxisH, { top: height - padding, left: padding, width: width - padding * 2 }]} />

        {/* Line segments */}
        {points.slice(0, -1).map((p, i) => {
          const next = points[i + 1];
          const length = Math.sqrt(Math.pow(next.x - p.x, 2) + Math.pow(next.y - p.y, 2));
          const angle = Math.atan2(next.y - p.y, next.x - p.x) * (180 / Math.PI);
          return (
            <View
              key={i}
              style={[
                styles.lineSegment,
                {
                  left: p.x,
                  top: p.y,
                  width: length,
                  transform: [{ rotate: `${angle}deg` }],
                },
              ]}
            />
          );
        })}

        {/* Points + labels */}
        {points.map((p, i) => (
          <React.Fragment key={i}>
            <View style={[styles.linePoint, { left: p.x - 6, top: p.y - 6 }]} />
            <Text style={[styles.linePointLabel, { left: p.x - 20, top: p.y + 10 }]}>{p.val}</Text>
            <Text style={[styles.lineLabel, { left: p.x - 30, top: height - 28 }]} numberOfLines={1}>{p.label}</Text>
          </React.Fragment>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>AI Assistant</Text>
        <Text style={styles.subtitle}>
          Paste messy data → get professional charts &amp; docs
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Paste your messy information here...&#10;Example:&#10;Sales Q1: 450&#10;Marketing: 320&#10;Revenue - 890"
          multiline
          numberOfLines={8}
          value={input}
          onChangeText={setInput}
          placeholderTextColor="#999"
        />

        <View style={styles.buttonRow}>
          <Pressable style={styles.primaryButton} onPress={processInput}>
            <Text style={styles.buttonText}>Generate Professional Output</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={reset}>
            <Text style={styles.secondaryButtonText}>Reset</Text>
          </Pressable>
        </View>

        {chartData && (
          <View style={styles.toggleRow}>
            <Pressable
              style={[styles.toggleButton, chartType === 'bar' && styles.toggleActive]}
              onPress={() => setChartType('bar')}>
              <Text style={[styles.toggleText, chartType === 'bar' && styles.toggleTextActive]}>Bar</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, chartType === 'pie' && styles.toggleActive]}
              onPress={() => setChartType('pie')}>
              <Text style={[styles.toggleText, chartType === 'pie' && styles.toggleTextActive]}>Pie</Text>
            </Pressable>
            <Pressable
              style={[styles.toggleButton, chartType === 'line' && styles.toggleActive]}
              onPress={() => setChartType('line')}>
              <Text style={[styles.toggleText, chartType === 'line' && styles.toggleTextActive]}>Line</Text>
            </Pressable>
          </View>
        )}

        {chartData && (
          <View style={styles.outputSection}>
            <Text style={styles.sectionTitle}>📊 Professional Chart</Text>
            <View style={styles.chart}>
              {chartType === 'bar'
                ? renderBarChart(chartData)
                : chartType === 'pie'
                ? renderPieChart(chartData)
                : renderLineChart(chartData)}
            </View>
          </View>
        )}

        {document && (
          <View style={styles.outputSection}>
            <Text style={styles.sectionTitle}>📄 Professional Document</Text>
            <View style={styles.documentBox}>
              <Text style={styles.documentText}>{document}</Text>
            </View>
          </View>
        )}

        {chartData && (
          <View style={styles.outputSection}>
            <Text style={styles.sectionTitle}>📈 Insights</Text>
            <View style={styles.insightsBox}>
              <Text style={styles.insightText}>
                Total: {chartData.values.reduce((a, b) => a + b, 0)} • Avg: {Math.round(chartData.values.reduce((a, b) => a + b, 0) / chartData.values.length)} • Max: {Math.max(...chartData.values)}
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  content: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    minHeight: 160,
    textAlignVertical: 'top',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0ea5e9',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 15,
  },
  secondaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: '#e2e8f0',
  },
  secondaryButtonText: {
    color: '#475569',
    fontWeight: '600',
  },
  outputSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 12,
  },
  chart: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  barLabel: {
    width: 90,
    fontSize: 14,
    color: '#475569',
  },
  barContainer: {
    flex: 1,
    height: 22,
    backgroundColor: '#f1f5f9',
    borderRadius: 6,
    overflow: 'hidden',
    marginRight: 12,
  },
  bar: {
    height: '100%',
    backgroundColor: '#0ea5e9',
    borderRadius: 6,
  },
  barValue: {
    width: 50,
    textAlign: 'right',
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  documentBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  documentText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#334155',
  },
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#0ea5e9',
  },
  toggleText: {
    color: '#475569',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
  },
  pieRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  pieDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  pieLabel: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
  },
  pieValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0f172a',
  },
});
