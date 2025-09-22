import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Container } from 'react-bootstrap';

export default function DisplayPage() {
  const [searchParams] = useSearchParams();

  // TODO: Read data and template name from searchParams
  // TODO: Implement different template styles

  const text = searchParams.get('text') || 'No content provided.';

  return (
    <Container className="mt-5">
      {/* This will be replaced with template-specific rendering */}
      <div className="p-5 border rounded" style={{ whiteSpace: 'pre-wrap', fontSize: '1.5rem' }}>
        {text}
      </div>
    </Container>
  );
}
