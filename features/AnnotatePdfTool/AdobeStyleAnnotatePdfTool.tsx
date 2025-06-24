import React, { useRef, useEffect } from 'react';
import { UploadedFile } from '../../types';
import { useAnnotatePdfTool } from './useAnnotatePdfTool';
import { useAppContext } from '../../contexts/AppContext';

// Import new components
import { AdobeStyleHeader } from './components/AdobeStyleHeader';
import { LeftToolbar } from './components/LeftToolbar';
import { ThumbnailPanel } from './components/ThumbnailPanel';
import { DocumentViewer } from './components/DocumentViewer';
import { PropertiesPanel } from './components/PropertiesPanel';
import { FooterControls } from './components/FooterControls';
import { ContextualToolbar } from './components/ContextualToolbar';
import { SearchPanel } from './components/SearchPanel';
import { AIAssistantPanel } from './components/AIAssistantPanel';
import { NotificationPanel } from './components/NotificationPanel';
import { UserProfileMenu } from './components/UserProfileMenu';
import { ShortcutsHelp } from './components/ShortcutsHelp';

// Import Adobe styles and hooks
import './components/AdobeStyle.css';
import { useAdobeUI } from './hooks/useAdobeUI';

interface AdobeStyleAnnotatePdfToolProps {
  uploadedFile: UploadedFile | undefined;
  onBackToTools?: () => void;
}

export const AdobeStyleAnnotatePdfTool: React.FC<AdobeStyleAnnotatePdfToolProps> = ({
  uploadedFile,
  onBackToTools,
}) => {
  const { isLoading: isLoadingApp } = useAppContext();
  const annotatePreviewCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI State using custom hook
  const uiState = useAdobeUI();

  const {
    annotationsByPage,
    currentAnnotatePageIndex, 
    setCurrentAnnotatePageIndex,
    annotatePageThumbnails,
    setCurrentAnnotationTool,
    textAnnotationInput, 
    setTextAnnotationInput,
    imageAnnotationFile, 
    setImageAnnotationFile,
    imageAnnotationCoords, 
    setImageAnnotationCoords,
    isProcessingAction,
    renderAnnotatePagePreviewOnCanvas,
    handleAddAnnotationToPage,
    handleSaveAnnotatedPdf,
  } = useAnnotatePdfTool({ uploadedFile });

  // Sync tool states
  useEffect(() => {
    if (uiState.activeTool === 'addText') {
      setCurrentAnnotationTool('text');
    } else if (uiState.activeTool === 'image') {
      setCurrentAnnotationTool('image');
    } else {
      setCurrentAnnotationTool(null);
    }
  }, [uiState.activeTool, setCurrentAnnotationTool]);

  // Render canvas when needed
  useEffect(() => {
    if (uploadedFile?.pdfDoc && annotatePageThumbnails.length > 0 && annotatePreviewCanvasRef.current) {
      renderAnnotatePagePreviewOnCanvas(annotatePreviewCanvasRef.current, currentAnnotatePageIndex);
    }
  }, [currentAnnotatePageIndex, annotationsByPage, uploadedFile, annotatePageThumbnails, renderAnnotatePagePreviewOnCanvas]);

  // Handle canvas click for positioning annotations
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!annotatePreviewCanvasRef.current) return;
    
    const canvas = annotatePreviewCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    
    const x = Math.round((event.clientX - rect.left) * scaleX);
    const y = Math.round((event.clientY - rect.top) * scaleY);

    if (uiState.activeTool === 'addText') {
      setTextAnnotationInput(prev => ({ ...prev, x, y }));
    } else if (uiState.activeTool === 'image') {
      setImageAnnotationCoords(prev => ({ ...prev, x, y }));
    }
  };

  // Handle add annotation with file input clearing
  const handleAddAnnotationAndClearInput = async () => {
    await handleAddAnnotationToPage();
    if (uiState.activeTool === 'image') {
      const fileInput = document.getElementById('image-input-ann') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
      setImageAnnotationFile(null);
    }
  };

  // Header handlers
  const handleMenuClick = (menuType: string) => {
    if (menuType === 'file' && onBackToTools) {
      onBackToTools();
    } else {
      console.log('Menu clicked:', menuType);
      // Implement other menu functionality
    }
  };

  const handleSearchClick = () => {
    uiState.toggleSearchPanel();
  };

  const handleShareClick = () => {
    console.log('Share clicked');
    // Implement share functionality
  };

  const handleAIAssistantClick = () => {
    uiState.toggleAIAssistant();
  };

  const handleNotificationsClick = () => {
    uiState.toggleNotifications();
  };

  const handleProfileClick = () => {
    uiState.toggleUserProfile();
  };

  // Footer handlers
  const handleRotateLeft = () => {
    console.log('Rotate left');
    // Implement rotation functionality
  };

  const handleRotateRight = () => {
    console.log('Rotate right');
    // Implement rotation functionality
  };

  // New handlers for additional functionality
  const handleSearch = (query: string) => {
    console.log('Searching for:', query);
    // Implement actual search functionality
    // This would search through the PDF content and return results
    uiState.setSearchResults([]);
  };

  const handleContextualAction = (action: string, value?: any) => {
    console.log('Contextual action:', action, value);
    // Implement contextual toolbar actions
  };



  // User profile handlers
  const handleUserProfileAction = (action: string) => {
    console.log('User profile action:', action);
    
    switch (action) {
      case 'help':
      case 'shortcuts':
        uiState.toggleShortcutsHelp();
        uiState.toggleUserProfile(); // Close profile menu
        break;
      case 'settings':
        // Implement settings
        break;
      case 'upgrade':
        // Implement upgrade
        break;
      case 'logout':
        // Implement logout
        break;
      default:
        // Handle other actions
        break;
    }
  };

  if (!uploadedFile) {
    return (
      <div className="h-screen flex flex-col bg-[#F9F9F9]">
        <AdobeStyleHeader 
          fileName="لا يوجد ملف"
          onMenuClick={handleMenuClick}
          onSearchClick={handleSearchClick}
          onShareClick={handleShareClick}
          onAIAssistantClick={handleAIAssistantClick}
          onNotificationsClick={handleNotificationsClick}
          onProfileClick={handleProfileClick}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <h2 className="text-xl font-semibold text-[#666666] mb-2">
              لا يوجد ملف محمل
            </h2>
            <p className="text-[#999999]">
              يرجى تحميل ملف PDF للبدء في التعديل
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#F9F9F9]">
      {/* Header */}
      <AdobeStyleHeader 
        fileName={uploadedFile.file.name}
        onMenuClick={handleMenuClick}
        onSearchClick={handleSearchClick}
        onShareClick={handleShareClick}
        onAIAssistantClick={handleAIAssistantClick}
        onNotificationsClick={handleNotificationsClick}
        onProfileClick={handleProfileClick}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Toolbar */}
        <LeftToolbar
          activeTool={uiState.activeTool}
          onToolChange={uiState.setActiveTool}
          onThumbnailsToggle={uiState.toggleThumbnails}
          showThumbnails={uiState.showThumbnails}
          selectedColor={uiState.selectedColor}
          onColorChange={uiState.setSelectedColor}
        />

        {/* Thumbnail Panel */}
        <ThumbnailPanel
          thumbnails={annotatePageThumbnails}
          currentPageIndex={currentAnnotatePageIndex}
          onPageSelect={setCurrentAnnotatePageIndex}
          isVisible={uiState.showThumbnails}
          isLoading={isLoadingApp && annotatePageThumbnails.length === 0}
        />

        {/* Document Viewer */}
        <DocumentViewer
          canvasRef={annotatePreviewCanvasRef}
          isLoading={isLoadingApp && annotatePageThumbnails.length === 0}
          hasDocument={!!uploadedFile?.pdfDoc && annotatePageThumbnails.length > 0}
          currentPageIndex={currentAnnotatePageIndex}
          totalPages={annotatePageThumbnails.length}
          onCanvasClick={handleCanvasClick}
        />

        {/* Properties Panel */}
        <PropertiesPanel
          isVisible={uiState.showPropertiesPanel}
          onClose={uiState.togglePropertiesPanel}
          activeTool={uiState.activeTool}
          currentPageIndex={currentAnnotatePageIndex}
          annotations={annotationsByPage[currentAnnotatePageIndex] || []}
          textInput={textAnnotationInput}
          onTextInputChange={setTextAnnotationInput}
          imageFile={imageAnnotationFile}
          imageCoords={imageAnnotationCoords}
          onImageFileChange={setImageAnnotationFile}
          onImageCoordsChange={setImageAnnotationCoords}
          onAddAnnotation={handleAddAnnotationAndClearInput}
          onSaveDocument={handleSaveAnnotatedPdf}
          isProcessing={isProcessingAction}
        />
      </div>

      {/* Contextual Toolbar */}
      <ContextualToolbar
        isVisible={uiState.showContextualToolbar}
        toolType={uiState.contextualToolbarType}
        position={uiState.contextualToolbarPosition}
        selectedElement={uiState.selectedElement}
        onAction={handleContextualAction}
      />

      {/* Search Panel */}
      <SearchPanel
        isVisible={uiState.showSearchPanel}
        onClose={uiState.toggleSearchPanel}
        onSearch={handleSearch}
        searchResults={uiState.searchResults}
        currentResultIndex={uiState.currentSearchResultIndex}
        onNavigateResult={uiState.setCurrentSearchResultIndex}
      />

      {/* AI Assistant Panel */}
      <AIAssistantPanel
        isVisible={uiState.showAIAssistant}
        onClose={uiState.toggleAIAssistant}
        currentPage={currentAnnotatePageIndex}
        totalPages={annotatePageThumbnails.length}
        documentContent={uploadedFile?.file.name}
      />

      {/* Notification Panel */}
      <NotificationPanel
        isVisible={uiState.showNotifications}
        onClose={uiState.toggleNotifications}
        notifications={uiState.notifications}
        onMarkAsRead={uiState.markNotificationAsRead}
        onClearAll={uiState.clearAllNotifications}
      />

      {/* User Profile Menu */}
      <UserProfileMenu
        isVisible={uiState.showUserProfile}
        onClose={uiState.toggleUserProfile}
        onAction={handleUserProfileAction}
      />

      {/* Shortcuts Help */}
      <ShortcutsHelp
        isVisible={uiState.showShortcutsHelp}
        onClose={uiState.toggleShortcutsHelp}
      />

      {/* Footer Controls */}
      {uploadedFile?.pdfDoc && annotatePageThumbnails.length > 0 && (
        <FooterControls
          currentPage={currentAnnotatePageIndex}
          totalPages={annotatePageThumbnails.length}
          currentZoom={uiState.currentZoom}
          onPageChange={setCurrentAnnotatePageIndex}
          onZoomChange={uiState.setCurrentZoom}
          onRotateLeft={handleRotateLeft}
          onRotateRight={handleRotateRight}
          displayMode={uiState.displayMode}
          onDisplayModeChange={uiState.setDisplayMode}
        />
      )}
    </div>
  );
};