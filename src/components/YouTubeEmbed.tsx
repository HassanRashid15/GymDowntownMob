import React from 'react';
import { View, StyleSheet, Platform, Linking, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

interface YouTubeEmbedProps {
  videoId: string;
  title?: string;
}

const buildEmbedHtml = (videoId: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0">
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      html, body { width: 100%; height: 100%; background: #0D0D0D; }
      iframe { width: 100%; height: 100%; border: 0; }
    </style>
  </head>
  <body>
    <iframe
      src="https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1"
      title="Equipment demo"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowfullscreen
    ></iframe>
  </body>
</html>
`;

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({ videoId, title }) => {
  const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;

  return (
    <View>
      <View style={styles.container}>
        {Platform.OS === 'web' ? (
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0&modestbranding=1`}
            style={{ width: '100%', height: '100%', border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            title={title ?? 'Equipment demo'}
          />
        ) : (
          <WebView
            source={{ html: buildEmbedHtml(videoId) }}
            style={styles.webview}
            allowsFullscreenVideo
            allowsInlineMediaPlayback
            mediaPlaybackRequiresUserAction={false}
            javaScriptEnabled
            domStorageEnabled
          />
        )}
      </View>
      <TouchableOpacity onPress={() => Linking.openURL(watchUrl)} style={styles.watchLinkBelow}>
        <Text style={styles.watchLinkText}>Watch on YouTube ↗</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0D0D0D',
  },
  webview: {
    flex: 1,
    backgroundColor: '#0D0D0D',
  },
  watchLinkBelow: {
    alignSelf: 'flex-end',
    marginTop: 8,
    paddingVertical: 4,
  },
  watchLinkText: {
    color: '#E88E83',
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
  },
});

export default YouTubeEmbed;
