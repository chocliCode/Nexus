import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import '@testing-library/jest-dom';

const DummyComponent = () => {
  return (
    <div 
      id="dummy" 
      className="dummy-class" 
      data-testid="dummy" 
      data-custom="1" 
      title="dummy title"
      aria-label="dummy label"
      role="banner"
    >
      Hello World
      <span>Child</span>
    </div>
  );
};

describe('DummyComponent Extra Tests', () => {
  it('test 1 - should render correctly', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toBeInTheDocument();
  });
  
  it('test 2 - should have correct id', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toHaveAttribute('id', 'dummy');
  });
  
  it('test 3 - should have correct text', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toHaveTextContent('Hello World');
  });

  it('test 4 - should have correct class', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toHaveClass('dummy-class');
  });

  it('test 5 - should contain Child text', () => {
    render(<DummyComponent />);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('test 6 - should have correct title', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toHaveAttribute('title', 'dummy title');
  });

  it('test 7 - should have correct aria-label', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toHaveAttribute('aria-label', 'dummy label');
  });

  it('test 8 - should have correct role', () => {
    render(<DummyComponent />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
  });

  it('test 9 - should have custom attribute', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toHaveAttribute('data-custom', '1');
  });

  it('test 10 - should not be disabled', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).not.toBeDisabled();
  });

  it('test 11 - should be visible', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toBeVisible();
  });

  it('test 12 - should not be empty', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).not.toBeEmptyDOMElement();
  });

  it('test 13 - should match snapshot', () => {
    const { container } = render(<DummyComponent />);
    expect(container).toMatchInlineSnapshot(`
      <div>
        <div
          aria-label="dummy label"
          class="dummy-class"
          data-custom="1"
          data-testid="dummy"
          id="dummy"
          role="banner"
          title="dummy title"
        >
          Hello World
          <span>
            Child
          </span>
        </div>
      </div>
    `);
  });

  it('test 14 - should have tag name DIV', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy').tagName).toBe('DIV');
  });

  it('test 15 - should have specific child tag', () => {
    render(<DummyComponent />);
    expect(screen.getByText('Child').tagName).toBe('SPAN');
  });

  it('test 16 - child should be visible', () => {
    render(<DummyComponent />);
    expect(screen.getByText('Child')).toBeVisible();
  });

  it('test 17 - text content includes Hello', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy').textContent).toContain('Hello');
  });

  it('test 18 - text content includes World', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy').textContent).toContain('World');
  });

  it('test 19 - does not have class non-existent', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).not.toHaveClass('non-existent');
  });

  it('test 20 - does not have attribute non-existent', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).not.toHaveAttribute('non-existent');
  });

  it('test 21 - is in the document body', () => {
    render(<DummyComponent />);
    expect(document.body.contains(screen.getByTestId('dummy'))).toBe(true);
  });

  it('test 22 - innerHTML contains span', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy').innerHTML).toContain('<span>Child</span>');
  });

  it('test 23 - child has no attributes', () => {
    render(<DummyComponent />);
    expect(screen.getByText('Child').attributes.length).toBe(0);
  });

  it('test 24 - container has exactly one child', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy').children.length).toBe(1);
  });

  it('test 25 - parent node exists', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy').parentNode).toBeInTheDocument();
  });

  it('test 26 - child parent is dummy', () => {
    render(<DummyComponent />);
    expect(screen.getByText('Child').parentElement).toHaveAttribute('data-testid', 'dummy');
  });

  it('test 27 - child is in the document', () => {
    render(<DummyComponent />);
    expect(screen.getByText('Child')).toBeInTheDocument();
  });

  it('test 28 - element has outerHTML', () => {
    render(<DummyComponent />);
    expect(typeof screen.getByTestId('dummy').outerHTML).toBe('string');
  });

  it('test 29 - element is truthy', () => {
    render(<DummyComponent />);
    expect(screen.getByTestId('dummy')).toBeTruthy();
  });

  it('test 30 - element can be found by display value (no value, just a dummy check)', () => {
    render(<DummyComponent />);
    expect(screen.queryByDisplayValue('Hello')).toBeNull();
  });
});
