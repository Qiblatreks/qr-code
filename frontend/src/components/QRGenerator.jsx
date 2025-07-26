import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Upload, Download, RefreshCw, Palette } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import { generateMockQRCode } from '../utils/mockQRGenerator';

const QRGenerator = () => {
  const [qrData, setQrData] = useState({
    type: 'url',
    content: '',
    headline: '',
    footer: '',
    logo: null,
    colors: {
      foreground: '#000000',
      background: '#ffffff',
      eyeColor: '#000000'
    },
    pattern: {
      moduleShape: 'square',
      eyePattern: 'square',
      backgroundPattern: 'none'
    },
    size: 300
  });

  const [generatedQR, setGeneratedQR] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef(null);
  const { toast } = useToast();

  const handleInputChange = (field, value) => {
    setQrData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleColorChange = (colorType, value) => {
    setQrData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: value
      }
    }));
  };

  const handlePatternChange = (patternType, value) => {
    setQrData(prev => ({
      ...prev,
      pattern: {
        ...prev.pattern,
        [patternType]: value
      }
    }));
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: "File too large",
          description: "Logo must be smaller than 2MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        setQrData(prev => ({
          ...prev,
          logo: e.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const generateQR = async () => {
    if (!qrData.content.trim()) {
      toast({
        title: "Content required",
        description: "Please enter content for your QR code",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Using mock generator for now
      const mockQR = await generateMockQRCode(qrData);
      setGeneratedQR(mockQR);
      toast({
        title: "QR Code Generated!",
        description: "Your custom QR code is ready",
      });
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "Failed to generate QR code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!generatedQR) return;

    const element = document.createElement('a');
    const file = new Blob([generatedQR], { type: 'image/svg+xml' });
    element.href = URL.createObjectURL(file);
    element.download = `qr-code-${Date.now()}.svg`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const renderContentForm = () => {
    switch (qrData.type) {
      case 'url':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="url">Website URL</Label>
              <Input
                id="url"
                type="url"
                placeholder="https://example.com"
                value={qrData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
              />
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="text">Text Content</Label>
              <Textarea
                id="text"
                placeholder="Enter your text here..."
                value={qrData.content}
                onChange={(e) => handleInputChange('content', e.target.value)}
                rows={4}
              />
            </div>
          </div>
        );
      case 'contact':
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  placeholder="John Doe"
                  value={qrData.contactName || ''}
                  onChange={(e) => setQrData(prev => ({ ...prev, contactName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  placeholder="+1234567890"
                  value={qrData.contactPhone || ''}
                  onChange={(e) => setQrData(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john@example.com"
                value={qrData.contactEmail || ''}
                onChange={(e) => setQrData(prev => ({ ...prev, contactEmail: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="organization">Organization</Label>
              <Input
                id="organization"
                placeholder="Company Name"
                value={qrData.contactOrg || ''}
                onChange={(e) => setQrData(prev => ({ ...prev, contactOrg: e.target.value }))}
              />
            </div>
          </div>
        );
      case 'wifi':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="ssid">Network Name (SSID)</Label>
              <Input
                id="ssid"
                placeholder="MyWiFiNetwork"
                value={qrData.wifiSSID || ''}
                onChange={(e) => setQrData(prev => ({ ...prev, wifiSSID: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="WiFi Password"
                value={qrData.wifiPassword || ''}
                onChange={(e) => setQrData(prev => ({ ...prev, wifiPassword: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="security">Security Type</Label>
              <Select value={qrData.wifiSecurity || 'WPA'} onValueChange={(value) => setQrData(prev => ({ ...prev, wifiSecurity: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select security type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="WPA">WPA/WPA2</SelectItem>
                  <SelectItem value="WEP">WEP</SelectItem>
                  <SelectItem value="nopass">No Password</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">SVG QR Code Generator</h1>
          <p className="text-lg text-gray-600">Create custom QR codes with logos, colors, and patterns</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Panel - Configuration */}
          <div className="space-y-6">
            {/* Content Type Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="w-5 h-5" />
                  Content Type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={qrData.type} onValueChange={(value) => handleInputChange('type', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="url">Website URL</SelectItem>
                    <SelectItem value="text">Plain Text</SelectItem>
                    <SelectItem value="contact">Contact Info</SelectItem>
                    <SelectItem value="wifi">WiFi Credentials</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Content Form */}
            <Card>
              <CardHeader>
                <CardTitle>Content Details</CardTitle>
              </CardHeader>
              <CardContent>
                {renderContentForm()}
              </CardContent>
            </Card>

            {/* Text Customization */}
            <Card>
              <CardHeader>
                <CardTitle>Text Labels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    placeholder="Scan me!"
                    value={qrData.headline}
                    onChange={(e) => handleInputChange('headline', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="footer">Footer</Label>
                  <Input
                    id="footer"
                    placeholder="Visit our website"
                    value={qrData.footer}
                    onChange={(e) => handleInputChange('footer', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Customization Options */}
            <Card>
              <CardHeader>
                <CardTitle>Customization</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="colors" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="colors">Colors</TabsTrigger>
                    <TabsTrigger value="patterns">Patterns</TabsTrigger>
                    <TabsTrigger value="logo">Logo</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="colors" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="foreground">Foreground</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="foreground"
                            type="color"
                            value={qrData.colors.foreground}
                            onChange={(e) => handleColorChange('foreground', e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            type="text"
                            value={qrData.colors.foreground}
                            onChange={(e) => handleColorChange('foreground', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="background">Background</Label>
                        <div className="flex items-center gap-2">
                          <Input
                            id="background"
                            type="color"
                            value={qrData.colors.background}
                            onChange={(e) => handleColorChange('background', e.target.value)}
                            className="w-16 h-10"
                          />
                          <Input
                            type="text"
                            value={qrData.colors.background}
                            onChange={(e) => handleColorChange('background', e.target.value)}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="eyeColor">Eye Color</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="eyeColor"
                          type="color"
                          value={qrData.colors.eyeColor}
                          onChange={(e) => handleColorChange('eyeColor', e.target.value)}
                          className="w-16 h-10"
                        />
                        <Input
                          type="text"
                          value={qrData.colors.eyeColor}
                          onChange={(e) => handleColorChange('eyeColor', e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="patterns" className="space-y-4">
                    <div>
                      <Label htmlFor="moduleShape">Module Shape</Label>
                      <Select value={qrData.pattern.moduleShape} onValueChange={(value) => handlePatternChange('moduleShape', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select module shape" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="diamond">Diamond</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="eyePattern">Eye Pattern</Label>
                      <Select value={qrData.pattern.eyePattern} onValueChange={(value) => handlePatternChange('eyePattern', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select eye pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="square">Square</SelectItem>
                          <SelectItem value="circle">Circle</SelectItem>
                          <SelectItem value="rounded">Rounded</SelectItem>
                          <SelectItem value="leaf">Leaf</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="backgroundPattern">Background Pattern</Label>
                      <Select value={qrData.pattern.backgroundPattern} onValueChange={(value) => handlePatternChange('backgroundPattern', value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select background pattern" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">None</SelectItem>
                          <SelectItem value="dots">Dots</SelectItem>
                          <SelectItem value="grid">Grid</SelectItem>
                          <SelectItem value="diagonal">Diagonal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="logo" className="space-y-4">
                    <div>
                      <Label htmlFor="logo">Upload Logo</Label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          Choose File
                        </Button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        {qrData.logo && (
                          <Button
                            variant="outline"
                            onClick={() => setQrData(prev => ({ ...prev, logo: null }))}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                      {qrData.logo && (
                        <div className="mt-4">
                          <img src={qrData.logo} alt="Logo preview" className="w-16 h-16 object-contain border rounded" />
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Preview */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Preview</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                {generatedQR ? (
                  <div className="space-y-4">
                    <div
                      className="mx-auto bg-white rounded-lg shadow-lg p-4 inline-block"
                      style={{ backgroundColor: qrData.colors.background }}
                    >
                      {qrData.headline && (
                        <h3 className="text-lg font-semibold mb-4 text-gray-800">{qrData.headline}</h3>
                      )}
                      <div
                        dangerouslySetInnerHTML={{ __html: generatedQR }}
                        className="flex justify-center"
                      />
                      {qrData.footer && (
                        <p className="text-sm text-gray-600 mt-4">{qrData.footer}</p>
                      )}
                    </div>
                    <Button onClick={downloadQR} className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download SVG
                    </Button>
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <RefreshCw className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p>Configure your QR code and click Generate to see preview</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Button
              onClick={generateQR}
              disabled={isGenerating}
              className="w-full h-12 text-lg font-semibold"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRGenerator;