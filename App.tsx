import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

const webAssets = [
  require('./assets/earth-explore/earth-blue-marble.jpg'),
  require('./assets/earth-explore/index.html'),
  require('./assets/earth-explore/night-sky.png'),
];

// 对应文件名（保持和 webAssets 索引一致）
const webAssetFileNames = [
  'earth-blue-marble.jpg',
  'index.html',
  'night-sky.png',
];

const targetDir = FileSystem.documentDirectory + 'earth-explore/';

export default function App() {
  const [htmlPath, setHtmlPath] = useState<string | null>(null);

  useEffect(() => {
    const prepareFiles = async () => {
      try {
        console.log('prepareFiles start');

        await FileSystem.deleteAsync(targetDir, { idempotent: true });
        await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });

        for (let i = 0; i < webAssets.length; i++) {
          const assetModule = webAssets[i];
          const fileName = webAssetFileNames[i];

          const moduleToUse = assetModule?.default ? assetModule.default : assetModule;
          const asset = Asset.fromModule(moduleToUse);
          await asset.downloadAsync();

          const destPath = targetDir + fileName;

          const info = await FileSystem.getInfoAsync(destPath);
          if (!info.exists) {
            await FileSystem.copyAsync({
              from: asset.localUri!,
              to: destPath,
            });
            console.log(`Copied ${fileName} to ${destPath}`);
          } else {
            console.log(`${fileName} already exists at ${destPath}`);
          }

          if (fileName === 'index.html') {
            setHtmlPath(destPath);
          }
        }

        console.log('prepareFiles completed');
      } catch (e) {
        console.error('prepareFiles error:', e);
      }
    };

    prepareFiles();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <SafeAreaView style={{ flex: 1 }}>
        {htmlPath ? (
          <WebView
            originWhitelist={['*']}
            source={{ uri: htmlPath }}
            style={styles.webview}
            allowFileAccess={true}
            allowUniversalAccessFromFileURLs={true} // 安卓生效，iOS忽略
          />
        ) : (
          <ActivityIndicator style={{ flex: 1 }} color="#555" />
        )}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  webview: { flex: 1, backgroundColor: '#000' },
});
