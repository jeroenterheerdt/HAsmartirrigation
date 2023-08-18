name: Bug report
description: File a bug report
about: Create a report to help us improve
title: "[Bug] "
labels: ["bug", "triage"]
assignees: jeroenterheerdt
body:
  - type: markdown
    attributes:
      value: |
        Thanks for taking the time to fill out this bug report!
  - type: textarea
    id: what-happened
    attributes:
      label: What happened?
      description: Also tell us, what did you expect to happen?
      placeholder: Tell us what you see!
      value: "A bug happened!"
    validations:
      required: true
   - type: input
    id: version
    attributes:
      label: Version
      description: What version of our software are you running?
    validations:
      required: true
  - type: textarea
      id: logs
      attributes:
        label: Relevant log output
        description: Please copy and paste any relevant log output. This will be automatically formatted into code, so no need for backticks.
        render: shell
 - type: checkboxes
    id: terms
    attributes:
      label: Diagnostics file
      description: You are required to attach a diagnostics file to your bug report. To download a diagnostics file, in Home Assistant, go to Settings>Devices&Services>Integrations>Smart Irrigation or use this link: https://my.home-assistant.io/redirect/integration/?domain=smart_irrigation. Click the 'three vertical dots' menu and select 'download diagnostics'.
      options:
        - label: I have attached a diagnostics file
          required: true
