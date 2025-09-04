# OneButtonPrompt - Claude Assistant Instructions

## Project-Specific Agent Usage

For this OneButtonPrompt project, ALWAYS use these specialized agents:

### Deployment & Infrastructure
**Use `docker-infrastructure-specialist` agent for:**
- Any Docker-related changes
- Deployment to production
- Portainer stack configuration
- Performance optimization
- Scaling and high-availability setup

### Documentation
**Use `documentation-specialist` agent for:**
- Updating README
- Creating user guides
- API documentation
- Deployment instructions

### Architecture Changes
**Use `application-design-architect` agent for:**
- Adding new features
- Database design changes
- API endpoint planning
- System architecture modifications

## Automatic Triggers
These keywords should trigger agent usage:
- "deploy" → docker-infrastructure-specialist
- "document" → documentation-specialist  
- "design" or "architecture" → application-design-architect
- "plan" or "research" → general-purpose

## Project Standards
- Always use Docker for deployments
- Follow the existing React + shadcn/ui patterns
- Maintain the Flask backend structure
- Keep AdSense integration intact