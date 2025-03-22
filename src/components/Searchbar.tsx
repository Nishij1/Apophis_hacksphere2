import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import styled, { DefaultTheme } from 'styled-components';
import { ArrowLeft } from 'lucide-react';
import { ThemeContext } from '../App';

interface StyledProps {
  isDark: boolean;
  theme?: DefaultTheme;
}

const SearchContainer = styled.div<StyledProps>`
  padding: 1rem;
  background-color: ${props => props.isDark ? '#1a1a1a' : '#ffffff'};
  color: ${props => props.isDark ? '#ffffff' : '#000000'};
`;

const SearchInput = styled.input<StyledProps>`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.isDark ? '#333333' : '#e5e5e5'};
  border-radius: 0.375rem;
  background-color: ${props => props.isDark ? '#2a2a2a' : '#ffffff'};
  color: ${props => props.isDark ? '#ffffff' : '#000000'};
  outline: none;
  
  &:focus {
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
  }
`;

const BackButton = styled.button<StyledProps>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: none;
  background: none;
  color: ${props => props.isDark ? '#ffffff' : '#000000'};
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const SearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useContext(ThemeContext);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <SearchContainer isDark={isDarkMode}>
      <BackButton isDark={isDarkMode} onClick={handleBack}>
        <ArrowLeft size={20} />
        Back
      </BackButton>
      <SearchInput
        isDark={isDarkMode}
        type="text"
        placeholder="Search medical terms..."
        aria-label="Search medical terms"
      />
    </SearchContainer>
  );
};

export default SearchBar;
