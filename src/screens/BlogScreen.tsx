import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import ScreenScrollView from '../components/ScreenScrollView';
import { navigateBackOrTo } from '../navigation/navigationHelpers';
import { getBlogPost, isHubApiConfigured, listBlogPosts, type BlogPost } from '../api/hub';

const SALMON = '#E88E83';
const CARD_BG = '#141414';
const CARD_BORDER = '#2A2A2A';

export const BlogScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!isHubApiConfigured()) {
      setError('Set EXPO_PUBLIC_API_BASE_URL to your hub URL.');
      setLoading(false);
      return;
    }
    try {
      const data = await listBlogPosts(24);
      setPosts(data.posts);
      setError(null);
    } catch (e: any) {
      setError(e?.message || 'Could not load blog');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'MainTabs' })}>
          <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>BLOG</Text>
        <View style={{ width: 56 }} />
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} size="large" />
        </View>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>
          {error ? <Text style={{ color: colors.mutedForeground }}>{error}</Text> : null}
          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              onPress={() => navigation.navigate('BlogDetail', { id: post.id, post })}
              style={[styles.card, { backgroundColor: CARD_BG, borderColor: CARD_BORDER }]}
              activeOpacity={0.9}
            >
              {post.imageUrl ? (
                <Image source={{ uri: post.imageUrl }} style={styles.image} />
              ) : null}
              <Text style={{ color: SALMON, fontFamily: 'Inter_700Bold', fontSize: 11, letterSpacing: 1 }}>
                {(post.category || 'ARTICLE').toUpperCase()}
              </Text>
              <Text style={[styles.postTitle, { color: colors.foreground }]}>{post.title}</Text>
              <Text style={{ color: colors.mutedForeground, marginTop: 6 }} numberOfLines={3}>
                {post.excerpt}
              </Text>
              <Text style={{ color: colors.mutedForeground, marginTop: 8, fontSize: 12 }}>
                {post.author}
                {post.readTime ? ` · ${post.readTime}` : ''}
              </Text>
            </TouchableOpacity>
          ))}
          {!error && posts.length === 0 ? (
            <Text style={{ color: colors.mutedForeground }}>No posts yet.</Text>
          ) : null}
        </ScreenScrollView>
      )}
    </View>
  );
};

export const BlogDetailScreen: React.FC = () => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const seed = route.params?.post as BlogPost | undefined;
  const [post, setPost] = useState<BlogPost | null>(seed || null);
  const [loading, setLoading] = useState(!seed?.content);

  useEffect(() => {
    const id = String(route.params?.id || seed?.id || '');
    if (!id || seed?.content) return;
    getBlogPost(id)
      .then((data) => setPost(data.post))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, [route.params?.id, seed]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: insets.top }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigateBackOrTo(navigation, { name: 'Blog' })}>
          <Text style={{ color: SALMON, fontFamily: 'Inter_600SemiBold' }}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.foreground }]}>ARTICLE</Text>
        <View style={{ width: 56 }} />
      </View>
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={SALMON} />
        </View>
      ) : (
        <ScreenScrollView contentContainerStyle={styles.scroll}>
          {post?.imageUrl ? <Image source={{ uri: post.imageUrl }} style={styles.hero} /> : null}
          <Text style={[styles.detailTitle, { color: colors.foreground }]}>{post?.title}</Text>
          <Text style={{ color: SALMON, marginBottom: 12 }}>
            {post?.author} · {post?.category}
          </Text>
          <Text style={{ color: colors.mutedForeground, lineHeight: 22 }}>
            {(post?.content || post?.excerpt || '').replace(/<[^>]+>/g, ' ').trim()}
          </Text>
        </ScreenScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  title: { fontFamily: 'BebasNeue_400Regular', fontSize: 22, letterSpacing: 1.5 },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scroll: { paddingHorizontal: 20, paddingBottom: 40 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 12, overflow: 'hidden' },
  image: { width: '100%', height: 140, borderRadius: 10, marginBottom: 10, backgroundColor: '#1C1C1E' },
  postTitle: { fontFamily: 'Inter_700Bold', fontSize: 17, marginTop: 6 },
  hero: { width: '100%', height: 200, borderRadius: 14, marginBottom: 14, backgroundColor: '#1C1C1E' },
  detailTitle: { fontFamily: 'BebasNeue_400Regular', fontSize: 28, letterSpacing: 1, marginBottom: 8 },
});
