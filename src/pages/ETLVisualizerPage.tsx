import { useState } from 'react';
import { 
  Container, 
  Title, 
  Text, 
  Stack, 
  Grid, 
  Tabs, 
  Card, 
  Group, 
  Button, 
  ThemeIcon,
  Alert,
  Badge,
  LoadingOverlay,
  Center
} from '@mantine/core';
import {
  IconDatabase,
  IconTransform,
  IconShieldCheck,
  IconChartLine,
  IconEye,
  IconInfoCircle,
  IconRocket,
  IconBrain,
  IconSettings
} from '@tabler/icons-react';
import { useETLData } from '@/hooks/useETLData';
import { InteractiveETLFlow } from '@/components/etl/InteractiveETLFlow';
import { ETLStepDetail } from '@/components/etl/ETLStepDetail';
import { DataTransformationViewer } from '@/components/etl/DataTransformationViewer';
import { ProcessingMetricsChart } from '@/components/etl/ProcessingMetricsChart';
import { ValidationExamples } from '@/components/etl/ValidationExamples';
import { ETLStep } from '@/types/etl';

export function ETLVisualizerPage() {
  const { etlPipelines, isLoading, error } = useETLData();
  const [activeTab, setActiveTab] = useState<string>('pipeline');
  const [selectedStep, setSelectedStep] = useState<ETLStep | null>(null);
  const [stepDetailOpened, setStepDetailOpened] = useState(false);

  const handleStepClick = (step: ETLStep) => {
    setSelectedStep(step);
    setStepDetailOpened(true);
  };

  const currentPipeline = etlPipelines[0];

  if (isLoading) {
    return (
      <Container size="xl">
        <LoadingOverlay visible={true} overlayProps={{ radius: "sm", blur: 2 }} />
        <Center h={400}>
          <Text>Loading ETL pipeline data...</Text>
        </Center>
      </Container>
    );
  }

  if (error) {
    return (
      <Container size="xl">
        <Alert icon={<IconInfoCircle size={16} />} title="Error" color="red">
          Unable to load ETL pipeline data. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <Container size="xl">
      {/* Hero Section */}
      <Card padding="xl" radius="md" mb="xl" bg="gradient-to-r from-blue-500 to-purple-600" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #7c3aed 100%)' }}>
        <Group justify="space-between" wrap="nowrap">
          <div>
            <Group mb="md">
              <ThemeIcon size="xl" variant="light" color="white">
                <IconRocket size={32} />
              </ThemeIcon>
              <div>
                <Title order={1} c="white" mb="xs">
                  Interactive ETL Learning Center
                </Title>
                <Text size="lg" c="gray.2">
                  Master financial data processing through hands-on exploration
                </Text>
              </div>
            </Group>
            
            <Text c="gray.3" mb="md">
              Dive deep into the CAMT.053 processing pipeline. Watch data transform in real-time, 
              understand validation rules, and explore the inner workings of modern ETL systems.
            </Text>
            
            <Group>
              <Badge variant="light" color="cyan" size="lg">ISO 20022 Standard</Badge>
              <Badge variant="light" color="green" size="lg">Real-time Processing</Badge>
              <Badge variant="light" color="orange" size="lg">Interactive Learning</Badge>
            </Group>
          </div>
          
          <ThemeIcon size={120} variant="light" color="white" style={{ opacity: 0.1 }}>
            <IconBrain size={80} />
          </ThemeIcon>
        </Group>
      </Card>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onChange={(value) => setActiveTab(value || 'pipeline')}>
        <Tabs.List mb="xl">
          <Tabs.Tab 
            value="pipeline" 
            leftSection={<IconSettings size={16} />}
          >
            Interactive Pipeline
          </Tabs.Tab>
          <Tabs.Tab 
            value="transformation" 
            leftSection={<IconTransform size={16} />}
          >
            Data Transformation
          </Tabs.Tab>
          <Tabs.Tab 
            value="validation" 
            leftSection={<IconShieldCheck size={16} />}
          >
            Validation Rules
          </Tabs.Tab>
          <Tabs.Tab 
            value="metrics" 
            leftSection={<IconChartLine size={16} />}
          >
            Performance Metrics
          </Tabs.Tab>
          <Tabs.Tab 
            value="learn" 
            leftSection={<IconEye size={16} />}
          >
            Learning Hub
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="pipeline">
          <Stack gap="xl">
            {currentPipeline && (
              <InteractiveETLFlow
                pipeline={currentPipeline}
                onStepClick={handleStepClick}
                autoPlay={false}
              />
            )}
            
            {/* Quick Actions */}
            <Grid>
              <Grid.Col span={4}>
                <Card padding="md" withBorder h="100%">
                  <Group mb="md">
                    <ThemeIcon variant="light" color="blue">
                      <IconRocket size={20} />
                    </ThemeIcon>
                    <Text fw={600}>Quick Start</Text>
                  </Group>
                  <Text size="sm" mb="md">
                    New to ETL? Start with the interactive pipeline to see how financial data flows through each processing step.
                  </Text>
                  <Button 
                    variant="light" 
                    fullWidth
                    onClick={() => setActiveTab('learn')}
                  >
                    Begin Learning Journey
                  </Button>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={4}>
                <Card padding="md" withBorder h="100%">
                  <Group mb="md">
                    <ThemeIcon variant="light" color="green">
                      <IconTransform size={20} />
                    </ThemeIcon>
                    <Text fw={600}>Try Data Transformation</Text>
                  </Group>
                  <Text size="sm" mb="md">
                    Watch your own data transform through each ETL step with customizable inputs and real-time visualization.
                  </Text>
                  <Button 
                    variant="light" 
                    fullWidth
                    onClick={() => setActiveTab('transformation')}
                  >
                    Transform Data
                  </Button>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={4}>
                <Card padding="md" withBorder h="100%">
                  <Group mb="md">
                    <ThemeIcon variant="light" color="orange">
                      <IconChartLine size={20} />
                    </ThemeIcon>
                    <Text fw={600}>Monitor Performance</Text>
                  </Group>
                  <Text size="sm" mb="md">
                    Explore real-time metrics and performance analytics to understand system health and optimization opportunities.
                  </Text>
                  <Button 
                    variant="light" 
                    fullWidth
                    onClick={() => setActiveTab('metrics')}
                  >
                    View Metrics
                  </Button>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Tabs.Panel>

        <Tabs.Panel value="transformation">
          <DataTransformationViewer
            onTransformationComplete={(result) => {
              console.log('Transformation completed:', result);
            }}
          />
        </Tabs.Panel>

        <Tabs.Panel value="validation">
          <ValidationExamples />
        </Tabs.Panel>

        <Tabs.Panel value="metrics">
          {currentPipeline && (
            <ProcessingMetricsChart
              metrics={currentPipeline.metrics}
              realTimeMode={true}
            />
          )}
        </Tabs.Panel>

        <Tabs.Panel value="learn">
          <Stack gap="xl">
            {/* Learning Introduction */}
            <Alert icon={<IconBrain size={16} />} title="Welcome to ETL Learning Hub" color="blue">
              This comprehensive learning center will help you understand every aspect of financial data processing. 
              Start with the basics and work your way through interactive examples.
            </Alert>

            {/* Learning Modules */}
            <Grid>
              <Grid.Col span={6}>
                <Card padding="lg" withBorder>
                  <ThemeIcon size="lg" color="blue" variant="light" mb="md">
                    <IconDatabase size={24} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} mb="md">ETL Fundamentals</Text>
                  <Text size="sm" mb="md">
                    Learn the core concepts of Extract, Transform, and Load processes. 
                    Understand how financial institutions process banking data at scale.
                  </Text>
                  <Stack gap="xs">
                    <Text size="xs">• What is ETL and why it matters</Text>
                    <Text size="xs">• CAMT.053 standard overview</Text>
                    <Text size="xs">• Data quality and validation</Text>
                    <Text size="xs">• Performance optimization</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Card padding="lg" withBorder>
                  <ThemeIcon size="lg" color="green" variant="light" mb="md">
                    <IconTransform size={24} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} mb="md">Data Transformation</Text>
                  <Text size="sm" mb="md">
                    Deep dive into how raw XML gets transformed into structured, 
                    validated financial data ready for analysis and reporting.
                  </Text>
                  <Stack gap="xs">
                    <Text size="xs">• XML parsing and extraction</Text>
                    <Text size="xs">• Foreign exchange conversion</Text>
                    <Text size="xs">• Risk assessment algorithms</Text>
                    <Text size="xs">• Data enrichment processes</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Card padding="lg" withBorder>
                  <ThemeIcon size="lg" color="orange" variant="light" mb="md">
                    <IconShieldCheck size={24} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} mb="md">Validation & Quality</Text>
                  <Text size="sm" mb="md">
                    Explore comprehensive validation rules that ensure data integrity, 
                    compliance, and business rule enforcement.
                  </Text>
                  <Stack gap="xs">
                    <Text size="xs">• Schema validation techniques</Text>
                    <Text size="xs">• Business rule implementation</Text>
                    <Text size="xs">• Duplicate detection methods</Text>
                    <Text size="xs">• Error handling strategies</Text>
                  </Stack>
                </Card>
              </Grid.Col>
              
              <Grid.Col span={6}>
                <Card padding="lg" withBorder>
                  <ThemeIcon size="lg" color="purple" variant="light" mb="md">
                    <IconChartLine size={24} />
                  </ThemeIcon>
                  <Text size="lg" fw={700} mb="md">Performance Monitoring</Text>
                  <Text size="sm" mb="md">
                    Learn how to monitor, measure, and optimize ETL pipeline performance 
                    for maximum efficiency and reliability.
                  </Text>
                  <Stack gap="xs">
                    <Text size="xs">• Key performance indicators</Text>
                    <Text size="xs">• Bottleneck identification</Text>
                    <Text size="xs">• Scalability considerations</Text>
                    <Text size="xs">• Real-time monitoring setup</Text>
                  </Stack>
                </Card>
              </Grid.Col>
            </Grid>

            {/* Interactive Learning Path */}
            <Card padding="lg" bg="blue.0" radius="md">
              <Group mb="md">
                <ThemeIcon size="lg" color="blue">
                  <IconRocket size={24} />
                </ThemeIcon>
                <Text size="xl" fw={700}>Recommended Learning Path</Text>
              </Group>
              
              <Text mb="md">
                Follow this structured approach to master ETL concepts through hands-on practice:
              </Text>
              
              <Grid>
                <Grid.Col span={6}>
                  <Stack gap="md">
                    <Group>
                      <Badge color="blue" size="lg">1</Badge>
                      <div>
                        <Text fw={600}>Start with Pipeline Overview</Text>
                        <Text size="sm" c="dimmed">Understand the complete flow</Text>
                      </div>
                    </Group>
                    
                    <Group>
                      <Badge color="blue" size="lg">2</Badge>
                      <div>
                        <Text fw={600}>Explore Data Transformation</Text>
                        <Text size="sm" c="dimmed">See data change step by step</Text>
                      </div>
                    </Group>
                    
                    <Group>
                      <Badge color="blue" size="lg">3</Badge>
                      <div>
                        <Text fw={600}>Test Validation Rules</Text>
                        <Text size="sm" c="dimmed">Try different data scenarios</Text>
                      </div>
                    </Group>
                  </Stack>
                </Grid.Col>
                
                <Grid.Col span={6}>
                  <Stack gap="md">
                    <Group>
                      <Badge color="green" size="lg">4</Badge>
                      <div>
                        <Text fw={600}>Monitor Performance</Text>
                        <Text size="sm" c="dimmed">Understand system metrics</Text>
                      </div>
                    </Group>
                    
                    <Group>
                      <Badge color="green" size="lg">5</Badge>
                      <div>
                        <Text fw={600}>Practice with Real Data</Text>
                        <Text size="sm" c="dimmed">Apply your knowledge</Text>
                      </div>
                    </Group>
                    
                    <Group>
                      <Badge color="green" size="lg">6</Badge>
                      <div>
                        <Text fw={600}>Explore Advanced Features</Text>
                        <Text size="sm" c="dimmed">Optimize and scale</Text>
                      </div>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Card>
          </Stack>
        </Tabs.Panel>
      </Tabs>

      {/* Step Detail Modal */}
      <ETLStepDetail
        step={selectedStep}
        opened={stepDetailOpened}
        onClose={() => setStepDetailOpened(false)}
      />
    </Container>
  );
}