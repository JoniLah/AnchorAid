import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {Button} from '../components/Button';
import {t} from '../i18n';

export const AnchoringTechniqueScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('howToAnchor')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('beginnersGuide')}
        </Text>
      </View>

      {/* Introduction */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('introduction')}</Text>
        <Text style={styles.paragraph}>
          {t('introductionText')}
        </Text>
      </View>

      {/* Step-by-Step Guide */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('stepByStepAnchoring')}</Text>

        {/* Step 1 */}
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => toggleStep(1)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepTitle}>{t('chooseLocation')}</Text>
              <Text style={styles.stepSubtitle}>{t('chooseLocationSubtitle')}</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedStep === 1 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 1 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                <Text style={styles.bold}>{t('whatToLookFor')}</Text>
                {'\n'}{t('whatToLookForText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('visualGuide')}</Text>
                {t('visualGuideText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('commonMistakesTitle')}</Text>
                {'\n'}{t('commonMistakesText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 2 */}
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => toggleStep(2)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepTitle}>{t('prepareAnchor')}</Text>
              <Text style={styles.stepSubtitle}>{t('prepareAnchorSubtitle')}</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedStep === 2 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 2 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                <Text style={styles.bold}>{t('preAnchoringChecklist')}</Text>
                {'\n'}{t('preAnchoringChecklistText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('equipmentSetup')}</Text>
                {t('equipmentSetupText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('safetyTip')}</Text>
                {'\n'}{t('safetyTipText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 3 */}
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => toggleStep(3)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepTitle}>{t('approachSpot')}</Text>
              <Text style={styles.stepSubtitle}>{t('approachSpotSubtitle')}</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedStep === 3 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 3 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                <Text style={styles.bold}>{t('approachTechnique')}</Text>
                {'\n'}{t('approachTechniqueText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('visualDiagram')}</Text>
                {t('visualDiagramText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('approachMistakes')}</Text>
                {'\n'}{t('approachMistakesText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 4 */}
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => toggleStep(4)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepTitle}>{t('dropAnchor')}</Text>
              <Text style={styles.stepSubtitle}>{t('dropAnchorSubtitle')}</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedStep === 4 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 4 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                <Text style={styles.bold}>{t('properDroppingTechnique')}</Text>
                {'\n'}{t('properDroppingTechniqueText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('whyLowerSlowly')}</Text>
                {'\n'}{t('whyLowerSlowlyText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('correctMethod')}</Text>
                {t('correctMethodText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('wrongMethod')}</Text>
                {t('wrongMethodText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 5 */}
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => toggleStep(5)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepTitle}>{t('payOutRode')}</Text>
              <Text style={styles.stepSubtitle}>{t('payOutRodeSubtitle')}</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedStep === 5 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 5 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                <Text style={styles.bold}>Paying out rode:</Text>
                {'\n'}1. As boat drifts back, pay out rode smoothly
                {'\n'}2. Don't let rode pile up - keep it organized
                {'\n'}3. Pay out to your calculated scope ratio
                {'\n'}4. Keep slight tension - don't let it go slack
                {'\n\n'}
                <Text style={styles.bold}>Scope Ratio Reminder:</Text>
                {'\n'}• Calm: 3:1 to 5:1
                {'\n'}• Normal: 5:1 to 7:1
                {'\n'}• Windy: 7:1 to 10:1
                {'\n'}• Storm: 10:1 or more
                {'\n\n'}
                <Text style={styles.bold}>Visual Process:</Text>
                {'\n'}
                {'\n'}    Step 1:  🚢 → ⚓ (anchor on bottom)
                {'\n'}    Step 2:  🚢 ← ⚓ (drift back, pay out)
                {'\n'}    Step 3:  🚢 ←← ⚓ (more scope)
                {'\n'}    Step 4:  🚢 ←←← ⚓ (full scope)
                {'\n\n'}
                <Text style={styles.bold}>Important:</Text>
                {'\n'}The rode should form a gentle curve, not be straight up and down.
                A straight rode means you don't have enough scope!
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 6 */}
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => toggleStep(6)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>6</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepTitle}>{t('setAnchor')}</Text>
              <Text style={styles.stepSubtitle}>{t('setAnchorSubtitle')}</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedStep === 6 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 6 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                <Text style={styles.bold}>{t('settingProcedure')}</Text>
                {'\n'}{t('settingProcedureText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('whatYouShouldSee')}</Text>
                {'\n'}{t('whatYouShouldSeeText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('warningSigns')}</Text>
                {'\n'}{t('warningSignsText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('ifAnchorDoesntSet')}</Text>
                {'\n'}{t('ifAnchorDoesntSetText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 7 */}
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => toggleStep(7)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>7</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepTitle}>{t('monitorPosition')}</Text>
              <Text style={styles.stepSubtitle}>{t('monitorPositionSubtitle')}</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedStep === 7 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 7 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                <Text style={styles.bold}>{t('monitoringChecklist')}</Text>
                {'\n'}{t('monitoringChecklistText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('visualReferencePoints')}</Text>
                {t('visualReferencePointsText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('usingAnchorAlarm')}</Text>
                {'\n'}{t('usingAnchorAlarmText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('signsOfDragging')}</Text>
                {'\n'}{t('signsOfDraggingText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('ifDraggingDetected')}</Text>
                {'\n'}{t('ifDraggingDetectedText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 8 */}
        <TouchableOpacity
          style={styles.stepCard}
          onPress={() => toggleStep(8)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>8</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={styles.stepTitle}>{t('retrieveAnchor')}</Text>
              <Text style={styles.stepSubtitle}>{t('retrieveAnchorSubtitle')}</Text>
            </View>
            <Text style={styles.expandIcon}>{expandedStep === 8 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 8 && (
            <View style={styles.stepContent}>
              <Text style={styles.stepText}>
                <Text style={styles.bold}>{t('retrievalProcedure')}</Text>
                {'\n'}{t('retrievalProcedureText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('retrievalVisualProcess')}</Text>
                {t('retrievalVisualProcessText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('importantTips')}</Text>
                {'\n'}{t('importantTipsText')}
                {'\n\n'}
                <Text style={styles.bold}>{t('ifAnchorIsStuck')}</Text>
                {'\n'}{t('ifAnchorIsStuckText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Common Mistakes Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('commonMistakes')}</Text>
        
        <View style={styles.mistakeCard}>
          <Text style={styles.mistakeTitle}>{t('notEnoughScope')}</Text>
          <Text style={styles.mistakeText}>
            {t('notEnoughScopeText')}
          </Text>
        </View>

        <View style={styles.mistakeCard}>
          <Text style={styles.mistakeTitle}>{t('droppingInsteadOfLowering')}</Text>
          <Text style={styles.mistakeText}>
            {t('droppingInsteadOfLoweringText')}
          </Text>
        </View>

        <View style={styles.mistakeCard}>
          <Text style={styles.mistakeTitle}>{t('notSettingAnchor')}</Text>
          <Text style={styles.mistakeText}>
            {t('notSettingAnchorText')}
          </Text>
        </View>

        <View style={styles.mistakeCard}>
          <Text style={styles.mistakeTitle}>{t('wrongAnchorForBottom')}</Text>
          <Text style={styles.mistakeText}>
            {t('wrongAnchorForBottomText')}
          </Text>
        </View>

        <View style={styles.mistakeCard}>
          <Text style={styles.mistakeTitle}>{t('notMonitoringPosition')}</Text>
          <Text style={styles.mistakeText}>
            {t('notMonitoringPositionText')}
          </Text>
        </View>

        <View style={styles.mistakeCard}>
          <Text style={styles.mistakeTitle}>{t('insufficientSwingRoom')}</Text>
          <Text style={styles.mistakeText}>
            {t('insufficientSwingRoomText')}
          </Text>
        </View>
      </View>

      {/* Best Practices */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('bestPractices')}</Text>
        
        <View style={styles.practiceCard}>
          <Text style={styles.practiceTitle}>{t('practiceInGoodConditions')}</Text>
          <Text style={styles.practiceText}>
            {t('practiceInGoodConditionsText')}
          </Text>
        </View>

        <View style={styles.practiceCard}>
          <Text style={styles.practiceTitle}>{t('useAdequateScope')}</Text>
          <Text style={styles.practiceText}>
            {t('useAdequateScopeText')}
          </Text>
        </View>

        <View style={styles.practiceCard}>
          <Text style={styles.practiceTitle}>{t('setAnchorAlarm')}</Text>
          <Text style={styles.practiceText}>
            {t('setAnchorAlarmText')}
          </Text>
        </View>

        <View style={styles.practiceCard}>
          <Text style={styles.practiceTitle}>{t('haveBackupPlan')}</Text>
          <Text style={styles.practiceText}>
            {t('haveBackupPlanText')}
          </Text>
        </View>

        <View style={styles.practiceCard}>
          <Text style={styles.practiceTitle}>{t('checkWeatherForecast')}</Text>
          <Text style={styles.practiceText}>
            {t('checkWeatherForecastText')}
          </Text>
        </View>
      </View>

      {/* Video Resources */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('videoResources')}</Text>
        <Text style={styles.paragraph}>
          {t('videoResourcesText')}
        </Text>
        
        <View style={styles.resourceCard}>
          <Text style={styles.resourceTitle}>{t('recommendedSearches')}</Text>
          <Text style={styles.resourceItem}>• "How to anchor a boat for beginners"</Text>
          <Text style={styles.resourceItem}>• "Proper anchor setting technique"</Text>
          <Text style={styles.resourceItem}>• "Anchor scope ratio explained"</Text>
          <Text style={styles.resourceItem}>• "How to retrieve anchor"</Text>
          <Text style={styles.resourceItem}>• "Anchor types and bottom conditions"</Text>
        </View>

        <Text style={styles.paragraph}>
          {t('lookForVideos')}
        </Text>
      </View>

      {/* Quick Reference */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('quickReferenceChecklist')}</Text>
        
        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>{t('beforeAnchoring')}</Text>
          <Text style={styles.checklistItem}>{t('checkWeatherForecastChecklist')}</Text>
          <Text style={styles.checklistItem}>{t('chooseLocationWithGoodHolding')}</Text>
          <Text style={styles.checklistItem}>{t('verifyAdequateSwingRoom')}</Text>
          <Text style={styles.checklistItem}>{t('checkAnchorAndRodeCondition')}</Text>
          <Text style={styles.checklistItem}>{t('calculateRequiredScope')}</Text>
        </View>

        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>{t('duringAnchoring')}</Text>
          <Text style={styles.checklistItem}>{t('approachSlowlyIntoWindCurrent')}</Text>
          <Text style={styles.checklistItem}>{t('lowerAnchorSlowly')}</Text>
          <Text style={styles.checklistItem}>{t('payOutRodeAsBoatDrifts')}</Text>
          <Text style={styles.checklistItem}>{t('setAnchorWithReversePower')}</Text>
          <Text style={styles.checklistItem}>{t('verifyAnchorIsHolding')}</Text>
        </View>

        <View style={styles.checklistCard}>
          <Text style={styles.checklistTitle}>{t('afterAnchoring')}</Text>
          <Text style={styles.checklistItem}>{t('setAnchorAlarmChecklist')}</Text>
          <Text style={styles.checklistItem}>{t('takeVisualBearings')}</Text>
          <Text style={styles.checklistItem}>{t('monitorPositionRegularly')}</Text>
          <Text style={styles.checklistItem}>{t('checkRodeTension')}</Text>
          <Text style={styles.checklistItem}>{t('watchForWeatherChanges')}</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={styles.section}>
        <Button
          title={t('backToGuide')}
          onPress={() => navigation.goBack()}
          variant="secondary"
          fullWidth
        />
        <View style={styles.buttonSpacer} />
        <Button
          title={t('startAnchoringSession')}
          onPress={() => (navigation as any).navigate('AnchoringSession')}
          fullWidth
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#007AFF',
    padding: 24,
    paddingTop: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.9,
  },
  section: {
    padding: 16,
    backgroundColor: '#fff',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  stepCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    overflow: 'hidden',
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  stepNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  stepHeaderContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  expandIcon: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: 8,
  },
  stepContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stepText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
    color: '#000',
  },
  mistakeCard: {
    backgroundColor: '#fff3cd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  mistakeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#856404',
    marginBottom: 8,
  },
  mistakeText: {
    fontSize: 14,
    color: '#856404',
    lineHeight: 20,
  },
  practiceCard: {
    backgroundColor: '#d4edda',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#155724',
    marginBottom: 8,
  },
  practiceText: {
    fontSize: 14,
    color: '#155724',
    lineHeight: 20,
  },
  resourceCard: {
    backgroundColor: '#e7f3ff',
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004085',
    marginBottom: 12,
  },
  resourceItem: {
    fontSize: 14,
    color: '#004085',
    marginBottom: 8,
    lineHeight: 20,
  },
  checklistCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  checklistItem: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonSpacer: {
    height: 12,
  },
});

