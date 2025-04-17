# Test Management UI Enhancement Mockup

## Enhanced Action Column

The Action column in the Test Management page has been enhanced with clearer, more visible buttons:

```
| Title                                | Instructor | Date       | Time                  | Duration | Status | Participants      | Actions                                      |
|--------------------------------------|------------|------------|----------------------|----------|--------|-------------------|----------------------------------------------|
| JEE Main Test Series - 6 Test Paper  | LAKSHYA    | 2025/01/20 | 02:00 PM - 05:00 PM  | 3 hours  | ONLINE | Class 12 Science | [Questions] [Edit] [Delete]                 |
| 12th Class Online Test (Chemistry)   | LAKSHYA    | 2025/01/09 | 07:30 PM - 08:30 PM  | 1 hour   | ONLINE | Class 12 Science | [Questions] [Edit] [Delete]                 |
```

### Button Styling

- **Questions Button**: Blue outline with text and icon
- **Edit Button**: Blue outline with text and icon
- **Delete Button**: Red outline with text and icon

### Permissions

- Only administrators can see and use the Edit and Delete buttons
- Regular users will not see these options

## Delete Confirmation Dialog

When a user clicks the Delete button, a confirmation dialog appears:

```
┌─────────────────────────────────────────────────────┐
│ Are you sure you want to delete this test?          │
│                                                     │
│ This action cannot be undone. This will permanently │
│ delete the test "JEE Main Test Series - 6 Test      │
│ Paper" and all associated questions and data.       │
│                                                     │
│                                [Cancel]   [Delete]  │
└─────────────────────────────────────────────────────┘
```

### Dialog Features

- Clear warning about the permanent nature of the action
- Shows the name of the test being deleted
- Cancel button to abort the deletion
- Delete button (red) to confirm the deletion

## Edit Functionality

When a user clicks the Edit button:

1. The existing test details form opens
2. All fields are pre-filled with the current test data
3. Users can modify any field
4. Clicking "Update Test" saves the changes

## Implementation Details

1. The Action column now uses a flex layout to better organize buttons
2. Text labels have been added to icons for better clarity
3. A confirmation dialog using AlertDialog component appears before deletion
4. The edit functionality uses the existing TestScheduleDialog with pre-filled data
5. All actions respect user permissions (admin-only)
