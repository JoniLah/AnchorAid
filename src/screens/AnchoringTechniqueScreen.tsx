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
import {useTheme} from '../theme/ThemeContext';
import {t} from '../i18n';

export const AnchoringTechniqueScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {colors, effectiveTheme} = useTheme();
  const [expandedStep, setExpandedStep] = useState<number | null>(null);

  const toggleStep = (step: number) => {
    setExpandedStep(expandedStep === step ? null : step);
  };

  return (
    <View style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={{paddingBottom: insets.bottom + 16}}>
      {/* Header */}
      <View style={[styles.header, {backgroundColor: colors.primary}]}>
        <Text style={styles.headerTitle}>{t('howToAnchor')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('beginnersGuide')}
        </Text>
      </View>

      {/* Introduction */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('introduction')}</Text>
        <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
          {t('introductionText')}
        </Text>
      </View>

      {/* Step-by-Step Guide */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('stepByStepAnchoring')}</Text>

        {/* Step 1 */}
        <TouchableOpacity
          style={[styles.stepCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border}]}
          onPress={() => toggleStep(1)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={[styles.stepTitle, {color: colors.text}]}>{t('chooseLocation')}</Text>
              <Text style={[styles.stepSubtitle, {color: colors.textSecondary}]}>{t('chooseLocationSubtitle')}</Text>
            </View>
            <Text style={[styles.expandIcon, {color: colors.primary}]}>{expandedStep === 1 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 1 && (
            <View style={[styles.stepContent, {borderTopColor: colors.border}]}>
              <Text style={[styles.stepText, {color: colors.text}]}>
                <Text style={[styles.bold, {color: colors.text}]}>{t('whatToLookFor')}</Text>
                {'\n'}{t('whatToLookForText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('visualGuide')}</Text>
                {t('visualGuideText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('commonMistakesTitle')}</Text>
                {'\n'}{t('commonMistakesText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 2 */}
        <TouchableOpacity
          style={[styles.stepCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border}]}
          onPress={() => toggleStep(2)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={[styles.stepTitle, {color: colors.text}]}>{t('prepareAnchor')}</Text>
              <Text style={[styles.stepSubtitle, {color: colors.textSecondary}]}>{t('prepareAnchorSubtitle')}</Text>
            </View>
            <Text style={[styles.expandIcon, {color: colors.primary}]}>{expandedStep === 2 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 2 && (
            <View style={[styles.stepContent, {borderTopColor: colors.border}]}>
              <Text style={[styles.stepText, {color: colors.text}]}>
                <Text style={[styles.bold, {color: colors.text}]}>{t('preAnchoringChecklist')}</Text>
                {'\n'}{t('preAnchoringChecklistText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('equipmentSetup')}</Text>
                {t('equipmentSetupText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('safetyTip')}</Text>
                {'\n'}{t('safetyTipText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 3 */}
        <TouchableOpacity
          style={[styles.stepCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border}]}
          onPress={() => toggleStep(3)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={[styles.stepTitle, {color: colors.text}]}>{t('approachSpot')}</Text>
              <Text style={[styles.stepSubtitle, {color: colors.textSecondary}]}>{t('approachSpotSubtitle')}</Text>
            </View>
            <Text style={[styles.expandIcon, {color: colors.primary}]}>{expandedStep === 3 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 3 && (
            <View style={[styles.stepContent, {borderTopColor: colors.border}]}>
              <Text style={[styles.stepText, {color: colors.text}]}>
                <Text style={[styles.bold, {color: colors.text}]}>{t('approachTechnique')}</Text>
                {'\n'}{t('approachTechniqueText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('visualDiagram')}</Text>
                {t('visualDiagramText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('approachMistakes')}</Text>
                {'\n'}{t('approachMistakesText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 4 */}
        <TouchableOpacity
          style={[styles.stepCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border}]}
          onPress={() => toggleStep(4)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={[styles.stepTitle, {color: colors.text}]}>{t('dropAnchor')}</Text>
              <Text style={[styles.stepSubtitle, {color: colors.textSecondary}]}>{t('dropAnchorSubtitle')}</Text>
            </View>
            <Text style={[styles.expandIcon, {color: colors.primary}]}>{expandedStep === 4 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 4 && (
            <View style={[styles.stepContent, {borderTopColor: colors.border}]}>
              <Text style={[styles.stepText, {color: colors.text}]}>
                <Text style={[styles.bold, {color: colors.text}]}>{t('properDroppingTechnique')}</Text>
                {'\n'}{t('properDroppingTechniqueText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('whyLowerSlowly')}</Text>
                {'\n'}{t('whyLowerSlowlyText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('correctMethod')}</Text>
                {t('correctMethodText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('wrongMethod')}</Text>
                {t('wrongMethodText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 5 */}
        <TouchableOpacity
          style={[styles.stepCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border}]}
          onPress={() => toggleStep(5)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
              <Text style={styles.stepNumberText}>5</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={[styles.stepTitle, {color: colors.text}]}>{t('payOutRode')}</Text>
              <Text style={[styles.stepSubtitle, {color: colors.textSecondary}]}>{t('payOutRodeSubtitle')}</Text>
            </View>
            <Text style={[styles.expandIcon, {color: colors.primary}]}>{expandedStep === 5 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 5 && (
            <View style={[styles.stepContent, {borderTopColor: colors.border}]}>
              <Text style={[styles.stepText, {color: colors.text}]}>
                <Text style={[styles.bold, {color: colors.text}]}>Paying out rode:</Text>
                {'\n'}1. As boat drifts back, pay out rode smoothly
                {'\n'}2. Don't let rode pile up - keep it organized
                {'\n'}3. Pay out to your calculated scope ratio
                {'\n'}4. Keep slight tension - don't let it go slack
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>Scope Ratio Reminder:</Text>
                {'\n'}• Calm: 3:1 to 5:1
                {'\n'}• Normal: 5:1 to 7:1
                {'\n'}• Windy: 7:1 to 10:1
                {'\n'}• Storm: 10:1 or more
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>Visual Process:</Text>
                {'\n'}
                {'\n'}    Step 1:  🚢 → ⚓ (anchor on bottom)
                {'\n'}    Step 2:  🚢 ← ⚓ (drift back, pay out)
                {'\n'}    Step 3:  🚢 ←← ⚓ (more scope)
                {'\n'}    Step 4:  🚢 ←←← ⚓ (full scope)
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>Important:</Text>
                {'\n'}The rode should form a gentle curve, not be straight up and down.
                A straight rode means you don't have enough scope!
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 6 */}
        <TouchableOpacity
          style={[styles.stepCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border}]}
          onPress={() => toggleStep(6)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
              <Text style={styles.stepNumberText}>6</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={[styles.stepTitle, {color: colors.text}]}>{t('setAnchor')}</Text>
              <Text style={[styles.stepSubtitle, {color: colors.textSecondary}]}>{t('setAnchorSubtitle')}</Text>
            </View>
            <Text style={[styles.expandIcon, {color: colors.primary}]}>{expandedStep === 6 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 6 && (
            <View style={[styles.stepContent, {borderTopColor: colors.border}]}>
              <Text style={[styles.stepText, {color: colors.text}]}>
                <Text style={[styles.bold, {color: colors.text}]}>{t('settingProcedure')}</Text>
                {'\n'}{t('settingProcedureText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('whatYouShouldSee')}</Text>
                {'\n'}{t('whatYouShouldSeeText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('warningSigns')}</Text>
                {'\n'}{t('warningSignsText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('ifAnchorDoesntSet')}</Text>
                {'\n'}{t('ifAnchorDoesntSetText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 7 */}
        <TouchableOpacity
          style={[styles.stepCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border}]}
          onPress={() => toggleStep(7)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
              <Text style={styles.stepNumberText}>7</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={[styles.stepTitle, {color: colors.text}]}>{t('monitorPosition')}</Text>
              <Text style={[styles.stepSubtitle, {color: colors.textSecondary}]}>{t('monitorPositionSubtitle')}</Text>
            </View>
            <Text style={[styles.expandIcon, {color: colors.primary}]}>{expandedStep === 7 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 7 && (
            <View style={[styles.stepContent, {borderTopColor: colors.border}]}>
              <Text style={[styles.stepText, {color: colors.text}]}>
                <Text style={[styles.bold, {color: colors.text}]}>{t('monitoringChecklist')}</Text>
                {'\n'}{t('monitoringChecklistText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('visualReferencePoints')}</Text>
                {t('visualReferencePointsText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('usingAnchorAlarm')}</Text>
                {'\n'}{t('usingAnchorAlarmText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('signsOfDragging')}</Text>
                {'\n'}{t('signsOfDraggingText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('ifDraggingDetected')}</Text>
                {'\n'}{t('ifDraggingDetectedText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Step 8 */}
        <TouchableOpacity
          style={[styles.stepCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa', borderColor: colors.border}]}
          onPress={() => toggleStep(8)}
          activeOpacity={0.7}>
          <View style={styles.stepHeader}>
            <View style={[styles.stepNumber, {backgroundColor: colors.primary}]}>
              <Text style={styles.stepNumberText}>8</Text>
            </View>
            <View style={styles.stepHeaderContent}>
              <Text style={[styles.stepTitle, {color: colors.text}]}>{t('retrieveAnchor')}</Text>
              <Text style={[styles.stepSubtitle, {color: colors.textSecondary}]}>{t('retrieveAnchorSubtitle')}</Text>
            </View>
            <Text style={[styles.expandIcon, {color: colors.primary}]}>{expandedStep === 8 ? '▼' : '▶'}</Text>
          </View>
          {expandedStep === 8 && (
            <View style={[styles.stepContent, {borderTopColor: colors.border}]}>
              <Text style={[styles.stepText, {color: colors.text}]}>
                <Text style={[styles.bold, {color: colors.text}]}>{t('retrievalProcedure')}</Text>
                {'\n'}{t('retrievalProcedureText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('retrievalVisualProcess')}</Text>
                {t('retrievalVisualProcessText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('importantTips')}</Text>
                {'\n'}{t('importantTipsText')}
                {'\n\n'}
                <Text style={[styles.bold, {color: colors.text}]}>{t('ifAnchorIsStuck')}</Text>
                {'\n'}{t('ifAnchorIsStuckText')}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Common Mistakes Section */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('commonMistakes')}</Text>
        
        <View style={[styles.mistakeCard, {backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd', borderLeftColor: colors.warning}]}>
          <Text style={[styles.mistakeTitle, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('notEnoughScope')}</Text>
          <Text style={[styles.mistakeText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
            {t('notEnoughScopeText')}
          </Text>
        </View>

        <View style={[styles.mistakeCard, {backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd', borderLeftColor: colors.warning}]}>
          <Text style={[styles.mistakeTitle, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('droppingInsteadOfLowering')}</Text>
          <Text style={[styles.mistakeText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
            {t('droppingInsteadOfLoweringText')}
          </Text>
        </View>

        <View style={[styles.mistakeCard, {backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd', borderLeftColor: colors.warning}]}>
          <Text style={[styles.mistakeTitle, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('notSettingAnchor')}</Text>
          <Text style={[styles.mistakeText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
            {t('notSettingAnchorText')}
          </Text>
        </View>

        <View style={[styles.mistakeCard, {backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd', borderLeftColor: colors.warning}]}>
          <Text style={[styles.mistakeTitle, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('wrongAnchorForBottom')}</Text>
          <Text style={[styles.mistakeText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
            {t('wrongAnchorForBottomText')}
          </Text>
        </View>

        <View style={[styles.mistakeCard, {backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd', borderLeftColor: colors.warning}]}>
          <Text style={[styles.mistakeTitle, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('notMonitoringPosition')}</Text>
          <Text style={[styles.mistakeText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
            {t('notMonitoringPositionText')}
          </Text>
        </View>

        <View style={[styles.mistakeCard, {backgroundColor: effectiveTheme === 'dark' ? '#3d2f00' : '#fff3cd', borderLeftColor: colors.warning}]}>
          <Text style={[styles.mistakeTitle, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>{t('insufficientSwingRoom')}</Text>
          <Text style={[styles.mistakeText, {color: effectiveTheme === 'dark' ? '#ffb300' : '#856404'}]}>
            {t('insufficientSwingRoomText')}
          </Text>
        </View>
      </View>

      {/* Best Practices */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('bestPractices')}</Text>
        
        <View style={[styles.practiceCard, {backgroundColor: effectiveTheme === 'dark' ? '#1a3d1a' : '#d4edda', borderLeftColor: colors.success}]}>
          <Text style={[styles.practiceTitle, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>{t('practiceInGoodConditions')}</Text>
          <Text style={[styles.practiceText, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>
            {t('practiceInGoodConditionsText')}
          </Text>
        </View>

        <View style={[styles.practiceCard, {backgroundColor: effectiveTheme === 'dark' ? '#1a3d1a' : '#d4edda', borderLeftColor: colors.success}]}>
          <Text style={[styles.practiceTitle, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>{t('useAdequateScope')}</Text>
          <Text style={[styles.practiceText, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>
            {t('useAdequateScopeText')}
          </Text>
        </View>

        <View style={[styles.practiceCard, {backgroundColor: effectiveTheme === 'dark' ? '#1a3d1a' : '#d4edda', borderLeftColor: colors.success}]}>
          <Text style={[styles.practiceTitle, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>{t('setAnchorAlarm')}</Text>
          <Text style={[styles.practiceText, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>
            {t('setAnchorAlarmText')}
          </Text>
        </View>

        <View style={[styles.practiceCard, {backgroundColor: effectiveTheme === 'dark' ? '#1a3d1a' : '#d4edda', borderLeftColor: colors.success}]}>
          <Text style={[styles.practiceTitle, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>{t('haveBackupPlan')}</Text>
          <Text style={[styles.practiceText, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>
            {t('haveBackupPlanText')}
          </Text>
        </View>

        <View style={[styles.practiceCard, {backgroundColor: effectiveTheme === 'dark' ? '#1a3d1a' : '#d4edda', borderLeftColor: colors.success}]}>
          <Text style={[styles.practiceTitle, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>{t('checkWeatherForecast')}</Text>
          <Text style={[styles.practiceText, {color: effectiveTheme === 'dark' ? '#66BB6A' : '#155724'}]}>
            {t('checkWeatherForecastText')}
          </Text>
        </View>
      </View>

      {/* Video Resources */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('videoResources')}</Text>
        <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
          {t('videoResourcesText')}
        </Text>
        
        <View style={[styles.resourceCard, {backgroundColor: effectiveTheme === 'dark' ? 'rgba(10, 132, 255, 0.2)' : '#e7f3ff'}]}>
          <Text style={[styles.resourceTitle, {color: effectiveTheme === 'dark' ? '#0A84FF' : '#004085'}]}>{t('recommendedSearches')}</Text>
          <Text style={[styles.resourceItem, {color: effectiveTheme === 'dark' ? '#B0B0B0' : '#004085'}]}>• "How to anchor a boat for beginners"</Text>
          <Text style={[styles.resourceItem, {color: effectiveTheme === 'dark' ? '#B0B0B0' : '#004085'}]}>• "Proper anchor setting technique"</Text>
          <Text style={[styles.resourceItem, {color: effectiveTheme === 'dark' ? '#B0B0B0' : '#004085'}]}>• "Anchor scope ratio explained"</Text>
          <Text style={[styles.resourceItem, {color: effectiveTheme === 'dark' ? '#B0B0B0' : '#004085'}]}>• "How to retrieve anchor"</Text>
          <Text style={[styles.resourceItem, {color: effectiveTheme === 'dark' ? '#B0B0B0' : '#004085'}]}>• "Anchor types and bottom conditions"</Text>
        </View>

        <Text style={[styles.paragraph, {color: colors.textSecondary}]}>
          {t('lookForVideos')}
        </Text>
      </View>

      {/* Quick Reference */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
        <Text style={[styles.sectionTitle, {color: colors.text}]}>{t('quickReferenceChecklist')}</Text>
        
        <View style={[styles.checklistCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'}]}>
          <Text style={[styles.checklistTitle, {color: colors.text}]}>{t('beforeAnchoring')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('checkWeatherForecastChecklist')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('chooseLocationWithGoodHolding')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('verifyAdequateSwingRoom')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('checkAnchorAndRodeCondition')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('calculateRequiredScope')}</Text>
        </View>

        <View style={[styles.checklistCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'}]}>
          <Text style={[styles.checklistTitle, {color: colors.text}]}>{t('duringAnchoring')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('approachSlowlyIntoWindCurrent')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('lowerAnchorSlowly')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('payOutRodeAsBoatDrifts')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('setAnchorWithReversePower')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('verifyAnchorIsHolding')}</Text>
        </View>

        <View style={[styles.checklistCard, {backgroundColor: effectiveTheme === 'dark' ? '#2C2C2C' : '#f8f9fa'}]}>
          <Text style={[styles.checklistTitle, {color: colors.text}]}>{t('afterAnchoring')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('setAnchorAlarmChecklist')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('takeVisualBearings')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('monitorPositionRegularly')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('checkRodeTension')}</Text>
          <Text style={[styles.checklistItem, {color: colors.textSecondary}]}>• {t('watchForWeatherChanges')}</Text>
        </View>
      </View>

      {/* Navigation */}
      <View style={[styles.section, {backgroundColor: colors.surface}]}>
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
    
    {/* Safe area background to prevent content showing through */}
    {insets.bottom > 0 && (
      <View style={[styles.safeAreaBackground, {height: insets.bottom, backgroundColor: colors.background}]} />
    )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  safeAreaBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    zIndex: 999,
  },
  header: {
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
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  stepCard: {
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
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
    marginBottom: 4,
  },
  stepSubtitle: {
    fontSize: 12,
  },
  expandIcon: {
    fontSize: 16,
    marginLeft: 8,
  },
  stepContent: {
    padding: 16,
    paddingTop: 0,
    borderTopWidth: 1,
  },
  stepText: {
    fontSize: 14,
    lineHeight: 22,
  },
  bold: {
    fontWeight: '600',
  },
  mistakeCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  mistakeTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  mistakeText: {
    fontSize: 14,
    lineHeight: 20,
  },
  practiceCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
  },
  practiceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  practiceText: {
    fontSize: 14,
    lineHeight: 20,
  },
  resourceCard: {
    padding: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  resourceItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  checklistCard: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  checklistTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  checklistItem: {
    fontSize: 14,
    marginBottom: 8,
    lineHeight: 20,
  },
  buttonSpacer: {
    height: 12,
  },
});

