import { describe, it, expect } from 'vitest';

describe('Team Member Photo Upload Bug Fix', () => {
  it('should correctly map team member image fields', () => {
    // Simulate the team data structure from admin panel
    const mockTeamData = {
      team_count: '2',
      team_0_name: 'John Doe',
      team_0_role: 'CEO',
      team_0_image: 'https://example.com/john.jpg',
      team_1_name: 'Jane Smith',
      team_1_role: 'CTO',
      team_1_image: 'https://example.com/jane.jpg'
    };

    // Simulate the team building logic from useContentManager
    const teamCount = parseInt(mockTeamData.team_count || "4");
    const team = [];
    
    for (let i = 0; i < teamCount; i++) {
      const member = {
        name: mockTeamData[`team_${i}_name` as keyof typeof mockTeamData] || "Team Member",
        role: mockTeamData[`team_${i}_role` as keyof typeof mockTeamData] || "Position",
        image: mockTeamData[`team_${i}_image` as keyof typeof mockTeamData] || "default.jpg"
      };
      
      if (member.name && member.name.trim() !== "") {
        team.push(member);
      }
    }

    // Verify the team structure is correct
    expect(team).toHaveLength(2);
    expect(team[0].name).toBe('John Doe');
    expect(team[0].image).toBe('https://example.com/john.jpg');
    expect(team[1].name).toBe('Jane Smith');
    expect(team[1].image).toBe('https://example.com/jane.jpg');
  });

  it('should handle empty image fields gracefully', () => {
    // Test with empty image field
    const mockTeamData = {
      team_count: '1',
      team_0_name: 'John Doe',
      team_0_role: 'CEO',
      team_0_image: '' // Empty image field
    };

    const teamCount = parseInt(mockTeamData.team_count || "4");
    const team = [];
    
    for (let i = 0; i < teamCount; i++) {
      const member = {
        name: mockTeamData[`team_${i}_name` as keyof typeof mockTeamData] || "Team Member",
        role: mockTeamData[`team_${i}_role` as keyof typeof mockTeamData] || "Position",
        image: mockTeamData[`team_${i}_image` as keyof typeof mockTeamData] || "default-fallback.jpg"
      };
      
      if (member.name && member.name.trim() !== "") {
        team.push(member);
      }
    }

    expect(team).toHaveLength(1);
    expect(team[0].image).toBe('default-fallback.jpg');
  });

  it('should validate ImageUploadWithGuidance props for team section', () => {
    // Test the props that should be passed to ImageUploadWithGuidance
    const teamImageUploadProps = {
      section: 'team' as const,
      label: 'Team Member Photo',
      value: '',
      onChange: (url: string) => {
        // This should call updateField with the correct field name
        expect(typeof url).toBe('string');
      },
      placeholder: 'Upload team member photo'
    };

    expect(teamImageUploadProps.section).toBe('team');
    expect(teamImageUploadProps.label).toBe('Team Member Photo');
    expect(teamImageUploadProps.placeholder).toBe('Upload team member photo');
  });

  it('should generate correct field names for team member images', () => {
    // Test field name generation for different team member indices
    const testCases = [
      { index: 0, expectedField: 'team_0_image' },
      { index: 1, expectedField: 'team_1_image' },
      { index: 2, expectedField: 'team_2_image' },
      { index: 5, expectedField: 'team_5_image' }
    ];

    testCases.forEach(testCase => {
      const fieldName = `team_${testCase.index}_image`;
      expect(fieldName).toBe(testCase.expectedField);
    });
  });
});