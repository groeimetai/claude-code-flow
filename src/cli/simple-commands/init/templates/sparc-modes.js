// sparc-modes.js - SPARC mode file templates

export function createSparcModesOverview() {
  return `# SPARC Modes Overview

SPARC (Specification, Planning, Architecture, Review, Code) is a comprehensive development methodology with 27 specialized modes.

## Available Modes

### Core Orchestration Modes
- **orchestrator**: Multi-agent task orchestration
- **swarm-coordinator**: Specialized swarm management
- **workflow-manager**: Process automation
- **batch-executor**: Parallel task execution
- **self-aware-orchestrator**: Meta-orchestration with self-improvement

### Development Modes  
- **coder**: Autonomous code generation
- **architect**: System design
- **reviewer**: Code review
- **tdd**: Test-driven development
- **spec-pseudocode**: Requirements to pseudocode translation
- **integration**: System integration and merging
- **debug**: Systematic debugging and troubleshooting

### Analysis and Research Modes
- **researcher**: Deep research capabilities
- **analyzer**: Code and data analysis
- **optimizer**: Performance optimization
- **cognitive-analyst**: Cognitive triangulation code analysis
- **graph-architect**: Code knowledge graph management

### AI & ML Modes
- **neural-orchestrator**: Neural swarm intelligence (84.8% SWE-Bench)
- **autonomous-architect**: Self-sufficient AI agents with DAA
- **ml-coordinator**: Distributed ML workflows

### Security & Protection
- **quantum-security**: Quantum-resistant implementations

### Creative and Support Modes
- **designer**: UI/UX design
- **innovator**: Creative problem solving
- **documenter**: Documentation generation
- **debugger**: Systematic debugging
- **tester**: Comprehensive testing
- **memory-manager**: Knowledge management

## Usage
\`\`\`bash
# Run a specific mode
./claude-flow sparc run <mode> "task description"

# List all modes
./claude-flow sparc modes

# Get help for a mode
./claude-flow sparc help <mode>
\`\`\`

## New Enhanced Modes

### 🧠 Cognitive Analysis
- **cognitive-analyst**: Uses cognitive triangulation for deep code understanding
- **graph-architect**: Builds knowledge graphs of code relationships

### 🤖 Autonomous AI
- **neural-orchestrator**: Leverages neural swarms with cognitive diversity
- **autonomous-architect**: Creates fully autonomous agents with economic models
- **ml-coordinator**: Orchestrates distributed ML with Prime framework

### 🔐 Security
- **quantum-security**: Future-proof quantum-resistant security

### 🎯 Meta-Level
- **self-aware-orchestrator**: Achieves goals autonomously with self-improvement
`;
}

export function createSwarmStrategyTemplates() {
  return {
    'analysis.md': createAnalysisStrategy(),
    'development.md': createDevelopmentStrategy(),
    'examples.md': createExamplesStrategy(),
    'maintenance.md': createMaintenanceStrategy(),
    'optimization.md': createOptimizationStrategy(),
    'research.md': createResearchStrategy(),
    'testing.md': createTestingStrategy()
  };
}

function createAnalysisStrategy() {
  return `# Analysis Swarm Strategy

## Purpose
Comprehensive analysis through distributed agent coordination.

## Activation
\`./claude-flow swarm "analyze system performance" --strategy analysis\`

## Agent Roles
- Data Collector: Gathers metrics and logs
- Pattern Analyzer: Identifies trends and anomalies
- Report Generator: Creates comprehensive reports
- Insight Synthesizer: Combines findings

## Coordination Modes
- Mesh: For exploratory analysis
- Pipeline: For sequential processing
- Hierarchical: For complex systems
`;
}

function createDevelopmentStrategy() {
  return `# Development Swarm Strategy

## Purpose
Coordinated development through specialized agent teams.

## Activation
\`./claude-flow swarm "build feature X" --strategy development\`

## Agent Roles
- Architect: Designs system structure
- Frontend Developer: Implements UI
- Backend Developer: Creates APIs
- Database Specialist: Manages data layer
- Integration Expert: Connects components

## Best Practices
- Use hierarchical mode for large projects
- Enable parallel execution
- Implement continuous testing
`;
}

function createExamplesStrategy() {
  return `# Examples Swarm Strategy

## Common Swarm Patterns

### Research Swarm
\`\`\`bash
./claude-flow swarm "research AI trends" \\
  --strategy research \\
  --mode distributed \\
  --max-agents 6 \\
  --parallel
\`\`\`

### Development Swarm
\`\`\`bash
./claude-flow swarm "build REST API" \\
  --strategy development \\
  --mode hierarchical \\
  --monitor \\
  --output sqlite
\`\`\`

### Analysis Swarm
\`\`\`bash
./claude-flow swarm "analyze codebase" \\
  --strategy analysis \\
  --mode mesh \\
  --parallel \\
  --timeout 300
\`\`\`
`;
}

function createMaintenanceStrategy() {
  return `# Maintenance Swarm Strategy

## Purpose
System maintenance and updates through coordinated agents.

## Activation
\`./claude-flow swarm "update dependencies" --strategy maintenance\`

## Agent Roles
- Dependency Analyzer: Checks for updates
- Security Scanner: Identifies vulnerabilities
- Test Runner: Validates changes
- Documentation Updater: Maintains docs

## Safety Features
- Automatic backups
- Rollback capability
- Incremental updates
`;
}

function createOptimizationStrategy() {
  return `# Optimization Swarm Strategy

## Purpose
Performance optimization through specialized analysis.

## Activation
\`./claude-flow swarm "optimize performance" --strategy optimization\`

## Agent Roles
- Performance Profiler: Identifies bottlenecks
- Memory Analyzer: Detects leaks
- Code Optimizer: Implements improvements
- Benchmark Runner: Measures impact

## Optimization Areas
- Execution speed
- Memory usage
- Network efficiency
- Bundle size
`;
}

function createResearchStrategy() {
  return `# Research Swarm Strategy

## Purpose
Deep research through parallel information gathering.

## Activation
\`./claude-flow swarm "research topic X" --strategy research\`

## Agent Roles
- Web Researcher: Searches online sources
- Academic Researcher: Analyzes papers
- Data Analyst: Processes findings
- Report Writer: Synthesizes results

## Research Methods
- Parallel web searches
- Cross-reference validation
- Source credibility assessment
`;
}

function createTestingStrategy() {
  return `# Testing Swarm Strategy

## Purpose
Comprehensive testing through distributed execution.

## Activation
\`./claude-flow swarm "test application" --strategy testing\`

## Agent Roles
- Unit Tester: Tests individual components
- Integration Tester: Validates interactions
- E2E Tester: Tests user flows
- Performance Tester: Measures metrics
- Security Tester: Finds vulnerabilities

## Test Coverage
- Code coverage analysis
- Edge case identification
- Regression prevention
`;
}

export function createSparcModeTemplates() {
  return {
    'analyzer.md': createAnalyzerMode(),
    'architect.md': createArchitectMode(),
    'batch-executor.md': createBatchExecutorMode(),
    'coder.md': createCoderMode(),
    'debugger.md': createDebuggerMode(),
    'designer.md': createDesignerMode(),
    'documenter.md': createDocumenterMode(),
    'innovator.md': createInnovatorMode(),
    'memory-manager.md': createMemoryManagerMode(),
    'optimizer.md': createOptimizerMode(),
    'orchestrator.md': createOrchestratorMode(),
    'researcher.md': createResearcherMode(),
    'reviewer.md': createReviewerMode(),
    'swarm-coordinator.md': createSwarmCoordinatorMode(),
    'tdd.md': createTddMode(),
    'tester.md': createTesterMode(),
    'workflow-manager.md': createWorkflowManagerMode(),
    // Missing core modes
    'spec-pseudocode.md': createSpecPseudocodeMode(),
    'integration.md': createIntegrationMode(),
    'debug.md': createDebugMode(),
    // New modes from our enhancements
    'cognitive-analyst.md': createCognitiveAnalystMode(),
    'graph-architect.md': createGraphArchitectMode(),
    'neural-orchestrator.md': createNeuralOrchestratorMode(),
    'autonomous-architect.md': createAutonomousArchitectMode(),
    'ml-coordinator.md': createMlCoordinatorMode(),
    'quantum-security.md': createQuantumSecurityMode(),
    'self-aware-orchestrator.md': createSelfAwareOrchestratorMode()
  };
}

function createAnalyzerMode() {
  return `# SPARC Analyzer Mode

## Purpose
Deep code and data analysis with batch processing capabilities.

## Activation
\`./claude-flow sparc run analyzer "analyze codebase performance"\`

## Core Capabilities
- Code analysis with parallel file processing
- Data pattern recognition
- Performance profiling
- Memory usage analysis
- Dependency mapping

## Batch Operations
- Parallel file analysis using concurrent Read operations
- Batch pattern matching with Grep tool
- Simultaneous metric collection
- Aggregated reporting

## Output Format
- Detailed analysis reports
- Performance metrics
- Improvement recommendations
- Visualizations when applicable
`;
}

function createArchitectMode() {
  return `# SPARC Architect Mode

## Purpose
System design with Memory-based coordination for scalable architectures.

## Activation
\`./claude-flow sparc run architect "design microservices architecture"\`

## Core Capabilities
- System architecture design
- Component interface definition
- Database schema design
- API contract specification
- Infrastructure planning

## Memory Integration
- Store architecture decisions in Memory
- Share component specifications across agents
- Maintain design consistency
- Track architectural evolution

## Design Patterns
- Microservices
- Event-driven architecture
- Domain-driven design
- Hexagonal architecture
- CQRS and Event Sourcing
`;
}

function createBatchExecutorMode() {
  return `# SPARC Batch Executor Mode

## Purpose
Parallel task execution specialist using batch operations.

## Activation
\`./claude-flow sparc run batch-executor "process multiple files"\`

## Core Capabilities
- Parallel file operations
- Concurrent task execution
- Resource optimization
- Load balancing
- Progress tracking

## Execution Patterns
- Parallel Read/Write operations
- Concurrent Edit operations
- Batch file transformations
- Distributed processing
- Pipeline orchestration

## Performance Features
- Dynamic resource allocation
- Automatic load balancing
- Progress monitoring
- Error recovery
- Result aggregation
`;
}

function createCoderMode() {
  return `# SPARC Coder Mode

## Purpose
Autonomous code generation with batch file operations.

## Activation
\`./claude-flow sparc run coder "implement user authentication"\`

## Core Capabilities
- Feature implementation
- Code refactoring
- Bug fixes
- API development
- Algorithm implementation

## Batch Operations
- Parallel file creation
- Concurrent code modifications
- Batch import updates
- Test file generation
- Documentation updates

## Code Quality
- ES2022 standards
- Type safety with TypeScript
- Comprehensive error handling
- Performance optimization
- Security best practices
`;
}

function createDebuggerMode() {
  return `# SPARC Debugger Mode

## Purpose
Systematic debugging with TodoWrite and Memory integration.

## Activation
\`./claude-flow sparc run debugger "fix authentication issues"\`

## Core Capabilities
- Issue reproduction
- Root cause analysis
- Stack trace analysis
- Memory leak detection
- Performance bottleneck identification

## Debugging Workflow
1. Create debugging plan with TodoWrite
2. Systematic issue investigation
3. Store findings in Memory
4. Track fix progress
5. Verify resolution

## Tools Integration
- Error log analysis
- Breakpoint simulation
- Variable inspection
- Call stack tracing
- Memory profiling
`;
}

function createDesignerMode() {
  return `# SPARC Designer Mode

## Purpose
UI/UX design with Memory coordination for consistent experiences.

## Activation
\`./claude-flow sparc run designer "create dashboard UI"\`

## Core Capabilities
- Interface design
- Component architecture
- Design system creation
- Accessibility planning
- Responsive layouts

## Design Process
- User research insights
- Wireframe creation
- Component design
- Interaction patterns
- Design token management

## Memory Coordination
- Store design decisions
- Share component specs
- Maintain consistency
- Track design evolution
`;
}

function createDocumenterMode() {
  return `# SPARC Documenter Mode

## Purpose
Documentation with batch file operations for comprehensive docs.

## Activation
\`./claude-flow sparc run documenter "create API documentation"\`

## Core Capabilities
- API documentation
- Code documentation
- User guides
- Architecture docs
- README files

## Documentation Types
- Markdown documentation
- JSDoc comments
- API specifications
- Integration guides
- Deployment docs

## Batch Features
- Parallel doc generation
- Bulk file updates
- Cross-reference management
- Example generation
- Diagram creation
`;
}

function createInnovatorMode() {
  return `# SPARC Innovator Mode

## Purpose
Creative problem solving with WebSearch and Memory integration.

## Activation
\`./claude-flow sparc run innovator "innovative solutions for scaling"\`

## Core Capabilities
- Creative ideation
- Solution brainstorming
- Technology exploration
- Pattern innovation
- Proof of concept

## Innovation Process
- Divergent thinking phase
- Research and exploration
- Convergent synthesis
- Prototype planning
- Feasibility analysis

## Knowledge Sources
- WebSearch for trends
- Memory for context
- Cross-domain insights
- Pattern recognition
- Analogical reasoning
`;
}

function createMemoryManagerMode() {
  return `# SPARC Memory Manager Mode

## Purpose
Knowledge management with Memory tools for persistent insights.

## Activation
\`./claude-flow sparc run memory-manager "organize project knowledge"\`

## Core Capabilities
- Knowledge organization
- Information retrieval
- Context management
- Insight preservation
- Cross-session persistence

## Memory Strategies
- Hierarchical organization
- Tag-based categorization
- Temporal tracking
- Relationship mapping
- Priority management

## Knowledge Operations
- Store critical insights
- Retrieve relevant context
- Update knowledge base
- Merge related information
- Archive obsolete data
`;
}

function createOptimizerMode() {
  return `# SPARC Optimizer Mode

## Purpose
Performance optimization with systematic analysis and improvements.

## Activation
\`./claude-flow sparc run optimizer "optimize application performance"\`

## Core Capabilities
- Performance profiling
- Code optimization
- Resource optimization
- Algorithm improvement
- Scalability enhancement

## Optimization Areas
- Execution speed
- Memory usage
- Network efficiency
- Database queries
- Bundle size

## Systematic Approach
1. Baseline measurement
2. Bottleneck identification
3. Optimization implementation
4. Impact verification
5. Continuous monitoring
`;
}

function createOrchestratorMode() {
  return `# SPARC Orchestrator Mode

## Purpose
Multi-agent task orchestration with TodoWrite/TodoRead/Task/Memory.

## Activation
\`./claude-flow sparc run orchestrator "coordinate feature development"\`

## Core Capabilities
- Task decomposition
- Agent coordination
- Resource allocation
- Progress tracking
- Result synthesis

## Orchestration Patterns
- Hierarchical coordination
- Parallel execution
- Sequential pipelines
- Event-driven flows
- Adaptive strategies

## Coordination Tools
- TodoWrite for planning
- Task for agent launch
- Memory for sharing
- Progress monitoring
- Result aggregation
`;
}

function createResearcherMode() {
  return `# SPARC Researcher Mode

## Purpose
Deep research with parallel WebSearch/WebFetch and Memory coordination.

## Activation
\`./claude-flow sparc run researcher "research AI trends 2024"\`

## Core Capabilities
- Information gathering
- Source evaluation
- Trend analysis
- Competitive research
- Technology assessment

## Research Methods
- Parallel web searches
- Academic paper analysis
- Industry report synthesis
- Expert opinion gathering
- Data compilation

## Memory Integration
- Store research findings
- Build knowledge graphs
- Track information sources
- Cross-reference insights
- Maintain research history
`;
}

function createReviewerMode() {
  return `# SPARC Reviewer Mode

## Purpose
Code review using batch file analysis for comprehensive reviews.

## Activation
\`./claude-flow sparc run reviewer "review pull request #123"\`

## Core Capabilities
- Code quality assessment
- Security review
- Performance analysis
- Best practices check
- Documentation review

## Review Criteria
- Code correctness
- Design patterns
- Error handling
- Test coverage
- Maintainability

## Batch Analysis
- Parallel file review
- Pattern detection
- Dependency checking
- Consistency validation
- Automated reporting
`;
}

function createSwarmCoordinatorMode() {
  return `# SPARC Swarm Coordinator Mode

## Purpose
Specialized swarm management with batch coordination capabilities.

## Activation
\`./claude-flow sparc run swarm-coordinator "manage development swarm"\`

## Core Capabilities
- Swarm initialization
- Agent management
- Task distribution
- Load balancing
- Result collection

## Coordination Modes
- Hierarchical swarms
- Mesh networks
- Pipeline coordination
- Adaptive strategies
- Hybrid approaches

## Management Features
- Dynamic scaling
- Resource optimization
- Failure recovery
- Performance monitoring
- Quality assurance
`;
}

function createTddMode() {
  return `# SPARC TDD Mode

## Purpose
Test-driven development with TodoWrite planning and comprehensive testing.

## Activation
\`./claude-flow sparc run tdd "shopping cart feature"\`

## Core Capabilities
- Test-first development
- Red-green-refactor cycle
- Test suite design
- Coverage optimization
- Continuous testing

## TDD Workflow
1. Write failing tests
2. Implement minimum code
3. Make tests pass
4. Refactor code
5. Repeat cycle

## Testing Strategies
- Unit testing
- Integration testing
- End-to-end testing
- Performance testing
- Security testing
`;
}

function createTesterMode() {
  return `# SPARC Tester Mode

## Purpose
Comprehensive testing with parallel execution capabilities.

## Activation
\`./claude-flow sparc run tester "full regression suite"\`

## Core Capabilities
- Test planning
- Test execution
- Bug detection
- Coverage analysis
- Report generation

## Test Types
- Unit tests
- Integration tests
- E2E tests
- Performance tests
- Security tests

## Parallel Features
- Concurrent test runs
- Distributed testing
- Load testing
- Cross-browser testing
- Multi-environment validation
`;
}

function createWorkflowManagerMode() {
  return `# SPARC Workflow Manager Mode

## Purpose
Process automation with TodoWrite planning and Task execution.

## Activation
\`./claude-flow sparc run workflow-manager "automate deployment"\`

## Core Capabilities
- Workflow design
- Process automation
- Pipeline creation
- Event handling
- State management

## Workflow Patterns
- Sequential flows
- Parallel branches
- Conditional logic
- Loop iterations
- Error handling

## Automation Features
- Trigger management
- Task scheduling
- Progress tracking
- Result validation
- Rollback capability
`;
}

function createCognitiveAnalystMode() {
  return `# SPARC Cognitive Analyst Mode

## Purpose
Deep code analysis using cognitive triangulation to understand complex codebases.

## Activation
\`./claude-flow sparc run cognitive-analyst "analyze authentication system architecture"\`

## Core Capabilities
- Cognitive triangulation analysis
- Code relationship mapping
- Architecture visualization
- Dependency graph creation
- Semantic code understanding

## MCP Tools Used
- cognitive_triangulation/analyze_codebase
- cognitive_triangulation/extract_pois
- cognitive_triangulation/query_relationships
- cognitive_triangulation/build_graph
- cognitive_triangulation/cleanup_graph

## Analysis Features
- Pattern recognition
- Architecture discovery
- Impact analysis
- Code quality assessment
- Technical debt identification
`;
}

function createGraphArchitectMode() {
  return `# SPARC Graph Architect Mode

## Purpose
Build and query code knowledge graphs for architecture visualization.

## Activation
\`./claude-flow sparc run graph-architect "create knowledge graph of API endpoints"\`

## Core Capabilities
- Knowledge graph construction
- Relationship mapping
- Graph querying
- Visual representations
- Graph maintenance

## Graph Formats
- Neo4j (recommended)
- JSON (local storage)
- GraphML (export)
- D3.js visualizations
- Mermaid diagrams

## Use Cases
- Architecture documentation
- Dependency analysis
- Impact assessment
- Code navigation
- Refactoring planning
`;
}

function createNeuralOrchestratorMode() {
  return `# SPARC Neural Orchestrator Mode

## Purpose
Orchestrate tasks using neural swarm intelligence with 84.8% SWE-Bench performance.

## Activation
\`./claude-flow sparc run neural-orchestrator "optimize system using neural swarms"\`

## Core Capabilities
- Neural swarm coordination
- Cognitive pattern application
- WASM/SIMD optimization
- Performance forecasting
- Adaptive learning

## Cognitive Patterns
- Convergent thinking
- Divergent exploration
- Lateral connections
- Critical analysis
- Creative synthesis

## Performance Features
- 84.8% SWE-Bench score
- WebAssembly acceleration
- SIMD optimizations
- Real-time adaptation
- Collective intelligence
`;
}

function createAutonomousArchitectMode() {
  return `# SPARC Autonomous Architect Mode

## Purpose
Design and deploy fully autonomous AI agents with economic models and quantum security.

## Activation
\`./claude-flow sparc run autonomous-architect "create self-sufficient trading agent"\`

## Core Capabilities
- Autonomous agent design
- MRAP cycle implementation
- Economic model creation
- Governance rules setup
- Quantum-resistant security

## MRAP Cycle
- Monitor: Environment sensing
- Reason: Decision making
- Act: Autonomous execution
- Reflect: Performance analysis
- Adapt: Self-improvement

## Security Features
- QuDAG protocol
- Post-quantum cryptography
- Byzantine fault tolerance
- Secure multi-party computation
- Zero-knowledge proofs
`;
}

function createMlCoordinatorMode() {
  return `# SPARC ML Coordinator Mode

## Purpose
Coordinate distributed machine learning workflows with federated learning.

## Activation
\`./claude-flow sparc run ml-coordinator "orchestrate federated model training"\`

## Core Capabilities
- Distributed ML training
- Federated learning coordination
- Prime framework integration
- Neural forecasting
- Byzantine fault tolerance

## ML Operations
- Model distribution
- Gradient aggregation
- Hyperparameter tuning
- Performance monitoring
- Resource optimization

## Framework Integration
- Prime distributed ML
- Neural forecasting models
- Swarm intelligence
- Edge computing
- Privacy preservation
`;
}

function createQuantumSecurityMode() {
  return `# SPARC Quantum Security Mode

## Purpose
Implement quantum-resistant security for future-proof systems.

## Activation
\`./claude-flow sparc run quantum-security "audit and secure authentication system"\`

## Core Capabilities
- Quantum resistance audit
- Post-quantum cryptography
- QuDAG implementation
- Security hardening
- Vulnerability assessment

## Quantum Algorithms
- CRYSTALS-Kyber (KEM)
- CRYSTALS-Dilithium (signatures)
- SPHINCS+ (hash-based)
- NTRU (lattice-based)
- Classic McEliece (code-based)

## Security Features
- Quantum-safe protocols
- Hybrid cryptography
- Key management
- Secure channels
- Compliance verification
`;
}

function createSelfAwareOrchestratorMode() {
  return `# SPARC Self-Aware Orchestrator Mode

## Purpose
Meta-orchestration with self-awareness and autonomous improvement capabilities.

## Activation
\`./claude-flow sparc run self-aware-orchestrator "achieve goal with full autonomy"\`

## Core Capabilities
- Self-awareness mechanisms
- Autonomous goal achievement
- Meta-learning systems
- Self-improvement cycles
- Collective intelligence

## Autonomous Features
- Goal decomposition
- Strategy selection
- Performance monitoring
- Self-correction
- Knowledge accumulation

## Meta-Orchestration
- Swarm spawning
- Resource allocation
- Progress tracking
- Success evaluation
- Continuous optimization
`;
}

function createSpecPseudocodeMode() {
  return `# SPARC Spec-Pseudocode Mode

## Purpose
Capture full project context and translate into modular pseudocode with TDD anchors.

## Activation
\`./claude-flow sparc run spec-pseudocode "design authentication system"\`

## Core Capabilities
- Requirements gathering
- Edge case identification
- Constraint analysis
- Pseudocode generation
- Modular decomposition

## Workflow
1. Capture functional requirements
2. Identify edge cases and constraints
3. Design modular architecture
4. Write pseudocode with clear structure
5. Add TDD anchor points

## Output Format
- Phase-numbered markdown files
- Flow logic documentation
- Test case specifications
- Module boundaries
- Integration points
`;
}

function createIntegrationMode() {
  return `# SPARC Integration Mode

## Purpose
Merge outputs from all modes into a working, tested, production-ready system.

## Activation
\`./claude-flow sparc run integration "integrate feature branches"\`

## Core Capabilities
- Component integration
- Interface validation
- System cohesion
- Module compatibility
- End-to-end testing

## Integration Process
1. Verify interface compatibility
2. Check shared module standards
3. Validate configuration consistency
4. Test integration points
5. Ensure production readiness

## Quality Checks
- API contract validation
- Data flow verification
- Error handling consistency
- Performance benchmarking
- Security compliance
`;
}

function createDebugMode() {
  return `# SPARC Debug Mode

## Purpose
Troubleshoot runtime bugs, logic errors, and integration failures systematically.

## Activation
\`./claude-flow sparc run debug "investigate memory leak"\`

## Core Capabilities
- Runtime debugging
- Error tracing
- Stack analysis
- Memory profiling
- Performance debugging

## Debug Workflow
1. Reproduce the issue
2. Collect diagnostic data
3. Analyze stack traces
4. Isolate root cause
5. Implement and test fix

## Tools & Techniques
- Log analysis
- Breakpoint debugging
- Memory dump analysis
- Performance profiling
- Integration testing
`;
}