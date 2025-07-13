import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Text,
  Group,
  Badge,
  Progress,
  Button,
  Timeline,
  ThemeIcon,
  Tooltip,
  Box,
  Stack,
  ActionIcon,
  Transition,
  Paper,
  Grid,
  Divider
} from '@mantine/core';
import {
  IconDatabase,
  IconTransform,
  IconShieldCheck,
  IconDownload,
  IconPlayerPlay,
  IconPlayerPause,
  IconRefresh,
  IconInfoCircle,
  IconCheck,
  IconLoader,
  IconX,
  IconSettings,
  IconTrendingUp
} from '@tabler/icons-react';
import { ETLPipelineData, ETLStep, StepStatus } from '@/types/etl';

interface InteractiveETLFlowProps {
  pipeline: ETLPipelineData;
  onStepClick: (step: ETLStep) => void;
  autoPlay?: boolean;
}

interface SimulationState {
  isRunning: boolean;
  currentStep: number;
  stepProgress: number;
  totalProgress: number;
}

const STEP_ICONS: Record<string, React.ReactElement> = {
  EXTRACT: <IconDownload size={20} />,
  TRANSFORM: <IconTransform size={20} />,
  VALIDATE: <IconShieldCheck size={20} />,
  LOAD: <IconDatabase size={20} />,
  RECONCILE: <IconTrendingUp size={20} />,
  AUDIT: <IconSettings size={20} />
};

const STEP_COLORS: Record<StepStatus, string> = {
  PENDING: 'gray',
  RUNNING: 'blue',
  COMPLETED: 'green',
  FAILED: 'red',
  SKIPPED: 'yellow',
  PAUSED: 'orange'
};

export function InteractiveETLFlow({ pipeline, onStepClick, autoPlay = false }: InteractiveETLFlowProps) {
  const [simulation, setSimulation] = useState<SimulationState>({
    isRunning: false,
    currentStep: 0,
    stepProgress: 0,
    totalProgress: 0
  });

  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const startSimulation = useCallback(() => {
    setSimulation(prev => ({ ...prev, isRunning: true, currentStep: 0, stepProgress: 0, totalProgress: 0 }));
    
    const totalSteps = pipeline.steps.length;
    let currentStepIndex = 0;
    
    const runStep = () => {
      if (currentStepIndex >= totalSteps) {
        setSimulation(prev => ({ ...prev, isRunning: false, totalProgress: 100 }));
        return;
      }

      const step = pipeline.steps[currentStepIndex];
      let stepProgress = 0;
      const stepDuration = Math.max(step.duration, 1000); // Minimum 1 second for demo
      const progressInterval = stepDuration / 100;

      setSimulation(prev => ({ 
        ...prev, 
        currentStep: currentStepIndex,
        stepProgress: 0
      }));

      const progressTimer = setInterval(() => {
        stepProgress += 1;
        const totalProgress = ((currentStepIndex * 100) + stepProgress) / totalSteps;
        
        setSimulation(prev => ({ 
          ...prev, 
          stepProgress,
          totalProgress
        }));

        if (stepProgress >= 100) {
          clearInterval(progressTimer);
          currentStepIndex++;
          setTimeout(runStep, 500); // Brief pause between steps
        }
      }, progressInterval);
    };

    runStep();
  }, [pipeline.steps]);

  useEffect(() => {
    if (autoPlay) {
      startSimulation();
    }
  }, [autoPlay, startSimulation]);

  const pauseSimulation = () => {
    setSimulation(prev => ({ ...prev, isRunning: false }));
  };

  const resetSimulation = () => {
    setSimulation({
      isRunning: false,
      currentStep: 0,
      stepProgress: 0,
      totalProgress: 0
    });
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const getStepStatus = (stepIndex: number): StepStatus => {
    if (!simulation.isRunning && simulation.totalProgress === 0) {
      return pipeline.steps[stepIndex].status;
    }
    
    if (stepIndex < simulation.currentStep) return 'COMPLETED';
    if (stepIndex === simulation.currentStep && simulation.isRunning) return 'RUNNING';
    return 'PENDING';
  };

  const getStepProgress = (stepIndex: number): number => {
    if (stepIndex < simulation.currentStep) return 100;
    if (stepIndex === simulation.currentStep) return simulation.stepProgress;
    return 0;
  };

  return (
    <Card shadow="sm" padding="xl" radius="md" withBorder>
      <Group justify="space-between" mb="lg">
        <div>
          <Text size="xl" fw={700} mb="xs">Interactive ETL Pipeline</Text>
          <Text size="sm" c="dimmed">
            Watch the CAMT.053 processing pipeline in action
          </Text>
        </div>
        
        <Group>
          <Tooltip label="Start simulation">
            <ActionIcon
              size="lg"
              variant="filled"
              color="blue"
              onClick={startSimulation}
              disabled={simulation.isRunning}
            >
              <IconPlayerPlay size={20} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Pause simulation">
            <ActionIcon
              size="lg"
              variant="filled"
              color="orange"
              onClick={pauseSimulation}
              disabled={!simulation.isRunning}
            >
              <IconPlayerPause size={20} />
            </ActionIcon>
          </Tooltip>
          
          <Tooltip label="Reset simulation">
            <ActionIcon
              size="lg"
              variant="filled"
              color="gray"
              onClick={resetSimulation}
            >
              <IconRefresh size={20} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      {/* Overall Progress */}
      <Card padding="md" radius="md" mb="xl" bg="gray.0">
        <Group justify="space-between" mb="xs">
          <Text fw={600} size="sm">Overall Progress</Text>
          <Text size="sm" c="dimmed">{Math.round(simulation.totalProgress)}%</Text>
        </Group>
        <Progress value={simulation.totalProgress} size="lg" radius="md" />
        {simulation.isRunning && (
          <Group mt="xs" gap="xs">
            <IconLoader size={16} className="animate-spin" />
            <Text size="xs" c="blue">
              Processing step {simulation.currentStep + 1} of {pipeline.steps.length}
            </Text>
          </Group>
        )}
      </Card>

      {/* Timeline View */}
      <Timeline active={simulation.currentStep} bulletSize={50} lineWidth={3}>
        {pipeline.steps.map((step, index) => {
          const status = getStepStatus(index);
          const progress = getStepProgress(index);
          const isExpanded = expandedSteps.has(step.id);
          
          return (
            <Timeline.Item
              key={step.id}
              bullet={
                <ThemeIcon
                  size={40}
                  variant="filled"
                  color={STEP_COLORS[status]}
                  radius="xl"
                >
                  {status === 'RUNNING' ? <IconLoader className="animate-spin" size={20} /> : 
                   status === 'COMPLETED' ? <IconCheck size={20} /> :
                   status === 'FAILED' ? <IconX size={20} /> :
                   STEP_ICONS[step.type] || <IconSettings size={20} />}
                </ThemeIcon>
              }
              title={
                <Group justify="space-between" style={{ width: '100%' }}>
                  <div>
                    <Text fw={600} size="lg">{step.name}</Text>
                    <Text size="sm" c="dimmed">{step.details.description}</Text>
                  </div>
                  <Group>
                    <Badge variant="light" color={STEP_COLORS[status]} size="sm">
                      {status}
                    </Badge>
                    <ActionIcon
                      size="sm"
                      variant="subtle"
                      onClick={() => toggleStepExpansion(step.id)}
                    >
                      <IconInfoCircle size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
              }
            >
              <Box mb="md">
                {/* Step Progress */}
                <Group mb="xs">
                  <Text size="sm" fw={500}>Progress:</Text>
                  <Progress value={progress} size="sm" style={{ flex: 1 }} />
                  <Text size="xs">{Math.round(progress)}%</Text>
                </Group>

                {/* Quick Stats */}
                <Grid gutter="xs" mb="md">
                  <Grid.Col span={3}>
                    <Paper p="xs" bg="blue.0" radius="sm">
                      <Text size="xs" c="blue" fw={600}>Input</Text>
                      <Text size="lg" fw={700}>{step.inputCount}</Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Paper p="xs" bg="green.0" radius="sm">
                      <Text size="xs" c="green" fw={600}>Output</Text>
                      <Text size="lg" fw={700}>{step.outputCount}</Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Paper p="xs" bg="red.0" radius="sm">
                      <Text size="xs" c="red" fw={600}>Errors</Text>
                      <Text size="lg" fw={700}>{step.errorCount}</Text>
                    </Paper>
                  </Grid.Col>
                  <Grid.Col span={3}>
                    <Paper p="xs" bg="gray.0" radius="sm">
                      <Text size="xs" c="gray" fw={600}>Duration</Text>
                      <Text size="lg" fw={700}>{step.duration}ms</Text>
                    </Paper>
                  </Grid.Col>
                </Grid>

                {/* Expandable Details */}
                <Transition mounted={isExpanded} transition="slide-down" duration={200}>
                  {(styles) => (
                    <Card style={styles} padding="md" bg="gray.0" radius="sm">
                      <Stack gap="md">
                        <div>
                          <Text size="sm" fw={600} mb="xs">Data Flow</Text>
                          <Group>
                            <Badge variant="outline">{step.details.inputFormat}</Badge>
                            <Text size="xs" c="dimmed">→</Text>
                            <Badge variant="outline">{step.details.outputFormat}</Badge>
                          </Group>
                        </div>

                        {step.details.transformationRules.length > 0 && (
                          <div>
                            <Text size="sm" fw={600} mb="xs">Transformation Rules</Text>
                            <Stack gap="xs">
                              {step.details.transformationRules.map((rule, idx) => (
                                <Group key={idx} gap="xs">
                                  <ThemeIcon size="xs" color="blue" variant="light">
                                    <IconCheck size={10} />
                                  </ThemeIcon>
                                  <Text size="xs">{rule}</Text>
                                </Group>
                              ))}
                            </Stack>
                          </div>
                        )}

                        {step.details.validationRules.length > 0 && (
                          <div>
                            <Text size="sm" fw={600} mb="xs">Validation Rules</Text>
                            <Stack gap="xs">
                              {step.details.validationRules.map((rule, idx) => (
                                <Group key={idx} gap="xs">
                                  <ThemeIcon size="xs" color="green" variant="light">
                                    <IconShieldCheck size={10} />
                                  </ThemeIcon>
                                  <Text size="xs">{rule}</Text>
                                </Group>
                              ))}
                            </Stack>
                          </div>
                        )}

                        <Divider />
                        
                        <Button
                          variant="light"
                          size="xs"
                          onClick={() => onStepClick(step)}
                          leftSection={<IconInfoCircle size={14} />}
                        >
                          View Detailed Analysis
                        </Button>
                      </Stack>
                    </Card>
                  )}
                </Transition>
              </Box>
            </Timeline.Item>
          );
        })}
      </Timeline>

      {/* Educational Content */}
      <Card mt="xl" padding="lg" bg="blue.0" radius="md">
        <Group mb="md">
          <ThemeIcon size="lg" color="blue" variant="light">
            <IconInfoCircle size={24} />
          </ThemeIcon>
          <Text size="lg" fw={700} c="blue">Understanding ETL Processes</Text>
        </Group>
        
        <Text size="sm" mb="md">
          ETL (Extract, Transform, Load) is a critical process for handling financial data. This pipeline specifically 
          processes CAMT.053 XML files - the ISO 20022 standard for bank account statements.
        </Text>
        
        <Grid>
          <Grid.Col span={6}>
            <Text size="sm" fw={600} mb="xs">Key Benefits:</Text>
            <Stack gap="xs">
              <Text size="xs">• Automated data validation and error detection</Text>
              <Text size="xs">• Real-time FX conversion and rate management</Text>
              <Text size="xs">• Standardized transaction categorization</Text>
              <Text size="xs">• Audit trail and compliance reporting</Text>
            </Stack>
          </Grid.Col>
          <Grid.Col span={6}>
            <Text size="sm" fw={600} mb="xs">Data Quality Assurance:</Text>
            <Stack gap="xs">
              <Text size="xs">• XML schema validation against ISO 20022</Text>
              <Text size="xs">• Business rule enforcement</Text>
              <Text size="xs">• Risk-based transaction classification</Text>
              <Text size="xs">• Reconciliation status tracking</Text>
            </Stack>
          </Grid.Col>
        </Grid>
      </Card>
    </Card>
  );
}