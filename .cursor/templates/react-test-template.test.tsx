import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { act } from '@testing-library/react';
import {{ComponentName}} from '../{{ComponentName}}';

/**
 * {{ComponentName}} Component Tests
 * Following Lyzer testing patterns for React components
 * Module: {{ModuleName}}
 */

// Mock API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Mock Next.js router if needed
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: '',
      asPath: '',
      push: jest.fn(),
      replace: jest.fn(),
    };
  },
}));

// Mock shared components
jest.mock('@/shared/layouts-components/seo/seo', () => {
  return function MockSeo({ title }: { title: string }) {
    return <div data-testid="seo" title={title} />;
  };
});

jest.mock('@/shared/layouts-components/page-header/pageheader', () => {
  return function MockPageheader({ title, subtitle }: { title: string; subtitle: string }) {
    return (
      <div data-testid="pageheader">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
    );
  };
});

describe('{{ComponentName}}', () => {
  beforeEach(() => {
    mockFetch.mockClear();
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly with initial state', () => {
    render(<{{ComponentName}} />);
    
    // Check if main components are rendered
    expect(screen.getByTestId('seo')).toBeInTheDocument();
    expect(screen.getByTestId('pageheader')).toBeInTheDocument();
    expect(screen.getByText('{{CardTitle}}')).toBeInTheDocument();
  });

  it('renders SEO and Pageheader with correct props', () => {
    render(<{{ComponentName}} />);
    
    // Check SEO
    const seoElement = screen.getByTestId('seo');
    expect(seoElement).toHaveAttribute('title', '{{PageTitle}}');
    
    // Check Pageheader
    expect(screen.getByText('{{ModuleName}}')).toBeInTheDocument();
    expect(screen.getByText('{{PageSubtitle}}')).toBeInTheDocument();
  });

  it('shows edit button in initial state', () => {
    render(<{{ComponentName}} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toBeInTheDocument();
    expect(editButton).not.toBeDisabled();
  });

  it('toggles to edit mode when edit button is clicked', async () => {
    render(<{{ComponentName}} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    // Should show Save and Cancel buttons
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument();
    
    // Edit button should not be visible
    expect(screen.queryByRole('button', { name: /^edit$/i })).not.toBeInTheDocument();
  });

  it('exits edit mode when cancel button is clicked', async () => {
    render(<{{ComponentName}} />);
    
    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    // Click cancel
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await act(async () => {
      fireEvent.click(cancelButton);
    });
    
    // Should return to initial state
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /save/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /cancel/i })).not.toBeInTheDocument();
  });

  it('handles form submission when save is clicked', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: {} }),
    });

    render(<{{ComponentName}} />);
    
    // Enter edit mode
    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    // Click save
    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    // Should exit edit mode after save
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    });
  });

  it('handles API errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    mockFetch.mockRejectedValueOnce(new Error('API Error'));
    
    render(<{{ComponentName}} />);
    
    // Enter edit mode and try to save
    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    // Should handle error (implementation depends on your error handling)
    expect(consoleSpy).toHaveBeenCalled();
    
    consoleSpy.mockRestore();
  });

  it('renders with custom props correctly', () => {
    const customProps = {
      // Add any props your component accepts
    };
    
    render(<{{ComponentName}} {...customProps} />);
    
    // Test custom prop behavior
    expect(screen.getByTestId('seo')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<{{ComponentName}} />);
    
    // Check for proper ARIA attributes
    const editButton = screen.getByRole('button', { name: /edit/i });
    expect(editButton).toHaveAttribute('type', 'button');
    
    // Check for form accessibility when in edit mode
    act(() => {
      fireEvent.click(editButton);
    });
    
    const form = screen.getByRole('form');
    expect(form).toBeInTheDocument();
  });

  it('follows the card structure pattern', () => {
    const { container } = render(<{{ComponentName}} />);
    
    // Check for proper Bootstrap card structure
    const card = container.querySelector('.custom-card');
    expect(card).toBeInTheDocument();
    
    const cardHeader = container.querySelector('.custom-card .card-header');
    expect(cardHeader).toBeInTheDocument();
    
    const cardBody = container.querySelector('.custom-card .card-body');
    expect(cardBody).toBeInTheDocument();
  });
});

/**
 * Integration Tests
 */
describe('{{ComponentName}} Integration', () => {
  it('integrates with API correctly', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        data: [
          // Mock API response data
        ]
      }),
    });

    render(<{{ComponentName}} />);
    
    // Test API integration behavior
    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/{{moduleName}}/{{resourceName}}'),
        expect.objectContaining({
          method: 'GET',
        })
      );
    });
  });
});

/**
 * Snapshot Tests
 */
describe('{{ComponentName}} Snapshots', () => {
  it('matches snapshot in initial state', () => {
    const { container } = render(<{{ComponentName}} />);
    expect(container.firstChild).toMatchSnapshot();
  });

  it('matches snapshot in edit mode', async () => {
    const { container } = render(<{{ComponentName}} />);
    
    const editButton = screen.getByRole('button', { name: /edit/i });
    await act(async () => {
      fireEvent.click(editButton);
    });
    
    expect(container.firstChild).toMatchSnapshot();
  });
});