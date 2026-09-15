import {
  Component,
  ElementRef,
  ViewChild,
  signal,
  AfterViewInit,
  OnDestroy,
  Inject,
  PLATFORM_ID
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Contact, animateContactSubmitButton } from '../../contact/contact';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

import {
  LucideAngularModule,
  Link2,
  Webhook,
  Store,
  GitBranch,
  Braces
} from 'lucide-angular';

interface SkillItem {
  name: string;
  icon: string;
  iconType: 'devicon' | 'lucide' | 'image';
}

interface SkillCategory {
  category: string;
  items: SkillItem[];
}

interface Project {
  title: string;
  description: string;
  year: string;
  techs: string[];
  link?: string;
}

@Component({
  imports: [
    FormsModule,
    Contact,
    LucideAngularModule
  ],

  selector: 'app-portfolio',
  styleUrl: './portfolio.css',
  templateUrl: './portfolio.html',
})
export class Portfolio implements AfterViewInit, OnDestroy {
  @ViewChild('portfolioContainer') portfolioContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('originDot') originDot!: ElementRef<HTMLDivElement>;
  @ViewChild('httpsLabel') httpsLabel!: ElementRef<HTMLSpanElement>;

  @ViewChild('node1Card') node1Card!: ElementRef<HTMLDivElement>;
  @ViewChild('node2Card') node2Card!: ElementRef<HTMLDivElement>;
  @ViewChild('node3Card') node3Card!: ElementRef<HTMLDivElement>;
  @ViewChild('node4Card') node4Card!: ElementRef<HTMLDivElement>;
  @ViewChild('node5Card') node5Card!: ElementRef<HTMLDivElement>;

  @ViewChild('node1ActiveLayer') node1ActiveLayer?: ElementRef<HTMLDivElement>;
  @ViewChild('node2ActiveLayer') node2ActiveLayer?: ElementRef<HTMLDivElement>;
  @ViewChild('node3ActiveLayer') node3ActiveLayer?: ElementRef<HTMLDivElement>;
  @ViewChild('node4ActiveLayer') node4ActiveLayer?: ElementRef<HTMLDivElement>;
  @ViewChild('node5ActiveLayer') node5ActiveLayer?: ElementRef<HTMLDivElement>;

  @ViewChild('heroH1') heroH1?: ElementRef<HTMLHeadingElement>;
  @ViewChild('heroH2') heroH2?: ElementRef<HTMLHeadingElement>;
  @ViewChild('heroP') heroP?: ElementRef<HTMLParagraphElement>;
  @ViewChild('heroBtns') heroBtns?: ElementRef<HTMLDivElement>;

  @ViewChild('aboutTitle') aboutTitle?: ElementRef<HTMLHeadingElement>;
  @ViewChild('aboutP1') aboutP1?: ElementRef<HTMLParagraphElement>;
  @ViewChild('aboutP2') aboutP2?: ElementRef<HTMLParagraphElement>;

  @ViewChild('skillsTitle') skillsTitle?: ElementRef<HTMLHeadingElement>;
  @ViewChild('skillsContainer') skillsContainer?: ElementRef<HTMLDivElement>;

  @ViewChild('projectsTitle') projectsTitle?: ElementRef<HTMLHeadingElement>;
  @ViewChild('projectsContainer') projectsContainer?: ElementRef<HTMLDivElement>;

  @ViewChild('pathEl1') pathEl1?: ElementRef<SVGPathElement>;
  @ViewChild('pathEl2') pathEl2?: ElementRef<SVGPathElement>;
  @ViewChild('pathEl3') pathEl3?: ElementRef<SVGPathElement>;
  @ViewChild('pathEl4') pathEl4?: ElementRef<SVGPathElement>;
  @ViewChild('pathEl5') pathEl5?: ElementRef<SVGPathElement>;

  @ViewChild('arrowEl1') arrowEl1?: ElementRef<SVGPathElement>;
  @ViewChild('arrowEl2') arrowEl2?: ElementRef<SVGPathElement>;
  @ViewChild('arrowEl3') arrowEl3?: ElementRef<SVGPathElement>;
  @ViewChild('arrowEl4') arrowEl4?: ElementRef<SVGPathElement>;
  @ViewChild('arrowEl5') arrowEl5?: ElementRef<SVGPathElement>;

  path1 = signal<string>('');
  path2 = signal<string>('');
  path3 = signal<string>('');
  path4 = signal<string>('');
  path5 = signal<string>('');

  private readonly triggers: ScrollTrigger[] = [];
  private resizeObserver?: ResizeObserver;
  private skillsTimeline?: gsap.core.Timeline;
  private readonly animatedTextSections = new Set<string>();

  constructor(@Inject(PLATFORM_ID) private readonly platformId: Object) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resetAllNodesAndPaths();

    const runInit = () => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.reinitAll();
          if (window.scrollY <= 50) {
            this.resetAndPlayHeroAnimation(false);
          }
        });
      });
    };

    runInit();

    if (typeof document !== 'undefined') {
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          runInit();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        this.calculatePaths();
        ScrollTrigger.refresh();
      });
      if (this.portfolioContainer?.nativeElement) {
        this.resizeObserver.observe(this.portfolioContainer.nativeElement);
      }
    }
  }

  private reinitAll(): void {
    this.triggers.forEach(t => t.kill());
    this.triggers.length = 0;

    this.calculatePaths();
    this.initNodeScrollAnimations();
    this.initPathScrollAnimations();
    this.initSectionScrollAnimations();
    ScrollTrigger.refresh(true);

    if (typeof document !== 'undefined' && document.fonts) {
      document.fonts.ready.then(() => {
        this.calculatePaths();
        ScrollTrigger.refresh(true);
      });
    }
  }

  private readonly borderActiveColors = [
    '#0ea5e9',
    '#10b981',
    '#f59e0b',
    '#6366f1',
    '#f43f5e'
  ];
  private readonly borderGrayColor = '#cbd5e1';

  private activateNodeColor(index: number, immediate: boolean = false): void {
    const layers = [
      this.node1ActiveLayer?.nativeElement,
      this.node2ActiveLayer?.nativeElement,
      this.node3ActiveLayer?.nativeElement,
      this.node4ActiveLayer?.nativeElement,
      this.node5ActiveLayer?.nativeElement
    ];
    const cards = [
      this.node1Card?.nativeElement,
      this.node2Card?.nativeElement,
      this.node3Card?.nativeElement,
      this.node4Card?.nativeElement,
      this.node5Card?.nativeElement
    ];

    const targetLayer = layers[index - 1];
    const targetCard = cards[index - 1];
    const activeBorder = this.borderActiveColors[index - 1] || this.borderGrayColor;

    if (targetCard) {
      if (immediate) {
        gsap.set(targetCard, { borderColor: activeBorder });
      } else {
        gsap.to(targetCard, {
          borderColor: activeBorder,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }

    if (targetLayer) {
      if (immediate) {
        gsap.set(targetLayer, { clipPath: 'inset(0% 0% 0% 0%)' });
      } else {
        gsap.to(targetLayer, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: 0.6,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }
    }
  }

  private deactivateNodeColor(index: number, immediate: boolean = false): void {
    const layers = [
      this.node1ActiveLayer?.nativeElement,
      this.node2ActiveLayer?.nativeElement,
      this.node3ActiveLayer?.nativeElement,
      this.node4ActiveLayer?.nativeElement,
      this.node5ActiveLayer?.nativeElement
    ];
    const cards = [
      this.node1Card?.nativeElement,
      this.node2Card?.nativeElement,
      this.node3Card?.nativeElement,
      this.node4Card?.nativeElement,
      this.node5Card?.nativeElement
    ];

    const targetLayer = layers[index - 1];
    const targetCard = cards[index - 1];

    if (targetCard) {
      if (immediate) {
        gsap.set(targetCard, { borderColor: this.borderGrayColor });
      } else {
        gsap.to(targetCard, {
          borderColor: this.borderGrayColor,
          duration: 0.35,
          ease: 'power2.in',
          overwrite: 'auto'
        });
      }
    }

    if (targetLayer) {
      if (immediate) {
        gsap.set(targetLayer, { clipPath: 'inset(0% 0% 100% 0%)' });
      } else {
        gsap.to(targetLayer, {
          clipPath: 'inset(0% 0% 100% 0%)',
          duration: 0.35,
          ease: 'power2.in',
          overwrite: 'auto'
        });
      }
    }
  }

  private resetAllNodesAndPaths(): void {
    const allNodes = [
      this.node1Card?.nativeElement,
      this.node2Card?.nativeElement,
      this.node3Card?.nativeElement,
      this.node4Card?.nativeElement,
      this.node5Card?.nativeElement
    ];

    allNodes.forEach((node, idx) => {
      if (node) gsap.set(node, { opacity: 0, scale: 0.85, y: 35 });
      this.deactivateNodeColor(idx + 1, true);
    });

    const btnChildren = this.heroBtns?.nativeElement
      ? Array.from(this.heroBtns.nativeElement.children)
      : [];

    const heroElements = [
      this.heroH1?.nativeElement,
      this.heroH2?.nativeElement,
      this.heroP?.nativeElement,
      ...btnChildren
    ].filter(Boolean);
    gsap.set(heroElements, { opacity: 0, y: 24 });

    const aboutElements = [
      this.aboutTitle?.nativeElement,
      this.aboutP1?.nativeElement,
      this.aboutP2?.nativeElement
    ].filter(Boolean);
    gsap.set(aboutElements, { opacity: 0, y: 24 });

    if (this.skillsTimeline) {
      this.skillsTimeline.kill();
      this.skillsTimeline = undefined;
    }

    const skillsElements = this.getSkillsAnimationElements();
    gsap.set(skillsElements, { opacity: 0, y: 16 });

    const projectsElements = this.getProjectsAnimationElements();
    gsap.set(projectsElements, { opacity: 0, y: 16 });

    if (typeof document !== 'undefined') {
      const btn = document.querySelector('.contact-submit-btn');
      const wave = document.querySelector('.contact-btn-wave');
      if (btn) gsap.set(btn, { scale: 1 });
      if (wave) gsap.set(wave, { scale: 0, opacity: 0 });
    }

    const allPaths = [
      this.pathEl1?.nativeElement,
      this.pathEl2?.nativeElement,
      this.pathEl3?.nativeElement,
      this.pathEl4?.nativeElement,
      this.pathEl5?.nativeElement
    ];

    allPaths.forEach(path => {
      if (path) {
        const len = path.getTotalLength();
        gsap.set(path, { opacity: 0, strokeDasharray: len, strokeDashoffset: len });
      }
    });

    [
      this.arrowEl1?.nativeElement,
      this.arrowEl2?.nativeElement,
      this.arrowEl3?.nativeElement,
      this.arrowEl4?.nativeElement,
      this.arrowEl5?.nativeElement
    ].forEach(arrow => {
      if (arrow) this.setArrowState(arrow, { x: 0, y: 0, angle: 0, visible: false });
    });

    this.currentNavigatedIndex = 0;
    this.revealedNodes.clear();
    this.animatedTextSections.clear();
  }

  private startHeroAnimationSequence(): void {
    if (!this.pathEl1?.nativeElement || !this.originDot?.nativeElement || !this.node1Card?.nativeElement) {
      this.isAutoNavigating = false;
      return;
    }

    const pathEl = this.pathEl1.nativeElement;
    const length = pathEl.getTotalLength();
    const node1 = this.node1Card.nativeElement;

    // Anima os elementos de texto e os 3 botões/links da Apresentação um por um com movimento suave
    const btnChildren = this.heroBtns?.nativeElement
      ? Array.from(this.heroBtns.nativeElement.children)
      : [];

    const heroElements = [
      this.heroH1?.nativeElement,
      this.heroH2?.nativeElement,
      this.heroP?.nativeElement,
      ...btnChildren
    ].filter(Boolean);

    if (!this.animatedTextSections.has('hero')) {
      this.animatedTextSections.add('hero');
      gsap.fromTo(
        heroElements,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.95, stagger: 0.14, ease: 'power1.out', delay: 0.1 }
      );
    }

    // Executa a animação programada: HTTPS -> 1º Nó (Recebe dados do n8n)
    this.setHttpsLabelVisible(true);
    const initialLen = pathEl.getTotalLength() || 1;
    gsap.set(pathEl, { opacity: 1, strokeDasharray: initialLen, strokeDashoffset: initialLen });

    const animObj = { progress: 0 };
    this.autoNavTimeline = gsap.timeline({
      onComplete: () => {
        gsap.set(pathEl, { opacity: 1, strokeDashoffset: 0 });
        this.setArrowState(this.arrowEl1?.nativeElement, { x: 0, y: 0, angle: 0, visible: false });
        gsap.set(node1, { opacity: 1, scale: 1, y: 0 });
        this.currentNavigatedIndex = 1;
        this.revealedNodes.add(1);
        this.isAutoNavigating = false;
        ScrollTrigger.refresh();
      }
    });

    this.autoNavTimeline.to(animObj, {
      progress: 1,
      duration: 1.1,
      ease: 'power2.inOut',
      delay: 0.1,
      onUpdate: () => {
        const p = animObj.progress;
        const liveLen = pathEl.getTotalLength() || initialLen;
        const currentLen = liveLen * p;
        gsap.set(pathEl, { opacity: 1, strokeDashoffset: liveLen - currentLen });

        const arrowLen = Math.min(currentLen + 5, liveLen);
        const pt = pathEl.getPointAtLength(arrowLen);
        if (p >= 0.995) {
          this.setArrowState(this.arrowEl1?.nativeElement, { x: pt.x, y: pt.y, angle: 90, visible: false });
          gsap.to(node1, {
            opacity: 1,
            scale: 1,
            y: 0,
            duration: 0.4,
            ease: 'back.out(1.7)',
            overwrite: 'auto'
          });
          this.activateNodeColor(1);
        } else {
          const ptPrev = pathEl.getPointAtLength(Math.max(0, arrowLen - 2));
          const ptNext = pathEl.getPointAtLength(Math.min(arrowLen + 2, liveLen));
          const angle = Math.atan2(ptNext.y - ptPrev.y, ptNext.x - ptPrev.x) * (180 / Math.PI);
          this.setArrowState(this.arrowEl1?.nativeElement, { x: pt.x, y: pt.y, angle, visible: true });

          if (p >= 0.60) {
            gsap.to(node1, {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: 0.4,
              ease: 'back.out(1.7)',
              overwrite: 'auto'
            });
            this.deactivateNodeColor(1);
          } else {
            gsap.set(node1, { opacity: 0, scale: 0.85, y: 35 });
            this.deactivateNodeColor(1);
          }
        }
      }
    });
  }

  private resetAndPlayHeroAnimation(force: boolean = false): void {
    if (typeof window === 'undefined') return;
    if (!force && window.scrollY > 50) return;

    this.isAutoNavigating = true;

    if (this.autoNavTimer) {
      clearTimeout(this.autoNavTimer);
      this.autoNavTimer = undefined;
    }
    if (this.autoNavTimeline) {
      this.autoNavTimeline.kill();
      this.autoNavTimeline = undefined;
    }

    this.resetAllNodesAndPaths();

    if (force) {
      window.scrollTo({ top: 0, behavior: 'smooth' });

      let startTime: number | null = null;
      const checkTop = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const elapsed = timestamp - startTime;

        if (window.scrollY <= 15 || elapsed > 800) {
          this.startHeroAnimationSequence();
          ScrollTrigger.refresh(true);
        } else {
          requestAnimationFrame(checkTop);
        }
      };

      requestAnimationFrame(checkTop);
    } else {
      this.startHeroAnimationSequence();
    }
  }

  private animateAboutText(): void {
    if (typeof window !== 'undefined' && window.scrollY <= 35 && !this.isAutoNavigating) {
      return;
    }

    if (this.animatedTextSections.has('about')) return;
    this.animatedTextSections.add('about');

    const aboutElements = [
      this.aboutTitle?.nativeElement,
      this.aboutP1?.nativeElement,
      this.aboutP2?.nativeElement
    ].filter(Boolean);

    gsap.fromTo(
      aboutElements,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.95, stagger: 0.16, ease: 'power1.out', overwrite: 'auto' }
    );
  }

  private getSkillsAnimationElements(): Element[] {
    const elements: Element[] = [];
    if (this.skillsTitle?.nativeElement) {
      elements.push(this.skillsTitle.nativeElement);
    }
    if (this.skillsContainer?.nativeElement) {
      const categoryCards = Array.from(
        this.skillsContainer.nativeElement.querySelectorAll('.skill-category-card')
      );
      categoryCards.forEach((card) => {
        const title = card.querySelector('.skill-category-title');
        if (title) elements.push(title);
        const badges = Array.from(card.querySelectorAll('.skill-badge'));
        elements.push(...badges);
      });
    }
    return elements;
  }

  private animateSkillsText(): void {
    if (!this.skillsContainer?.nativeElement) return;
    if (this.animatedTextSections.has('skills')) return;
    this.animatedTextSections.add('skills');

    if (this.skillsTimeline) {
      this.skillsTimeline.kill();
    }

    this.skillsTimeline = gsap.timeline();

    if (this.skillsTitle?.nativeElement) {
      this.skillsTimeline.fromTo(
        this.skillsTitle.nativeElement,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.3, ease: 'power1.out' }
      );
    }

    const categoryCards = Array.from(
      this.skillsContainer.nativeElement.querySelectorAll('.skill-category-card')
    );

    categoryCards.forEach((card, index) => {
      const title = card.querySelector('.skill-category-title');
      const badges = Array.from(card.querySelectorAll('.skill-badge'));
      const cardElements = [title, ...badges].filter(Boolean);

      if (cardElements.length && this.skillsTimeline) {
        this.skillsTimeline.fromTo(
          cardElements,
          { opacity: 0, y: 16 },
          {
            opacity: 1,
            y: 0,
            duration: 0.28,
            stagger: 0.04,
            ease: 'power1.out'
          },
          index === 0 ? '-=0.1' : '-=0.18'
        );
      }
    });
  }

  private getProjectsAnimationElements(): Element[] {
    const elements: Element[] = [];
    if (this.projectsTitle?.nativeElement) {
      elements.push(this.projectsTitle.nativeElement);
    }
    if (this.projectsContainer?.nativeElement) {
      const cards = Array.from(
        this.projectsContainer.nativeElement.querySelectorAll('.project-card')
      );
      elements.push(...cards);
    }
    return elements;
  }

  private animateProjectsText(): void {
    if (this.animatedTextSections.has('projects')) return;
    this.animatedTextSections.add('projects');

    const elements = this.getProjectsAnimationElements();
    if (!elements.length) return;

    gsap.fromTo(
      elements,
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.16,
        ease: 'power1.out',
        overwrite: 'auto'
      }
    );
  }

  private animateContactButton(): void {
    if (typeof document === 'undefined') return;
    if (this.animatedTextSections.has('contact')) return;
    this.animatedTextSections.add('contact');

    animateContactSubmitButton(2);
  }

  private triggerTargetSectionAnimation(targetIdx: number): void {
    if (targetIdx === 2) this.animateAboutText();
    else if (targetIdx === 3) this.animateSkillsText();
    else if (targetIdx === 4) this.animateProjectsText();
    else if (targetIdx === 5) this.animateContactButton();
  }

  calculatePaths(): void {
    if (
      !this.portfolioContainer ||
      !this.originDot ||
      !this.node1Card ||
      !this.node2Card ||
      !this.node3Card ||
      !this.node4Card ||
      !this.node5Card
    ) {
      return;
    }

    const allNodes = [
      this.node1Card?.nativeElement,
      this.node2Card?.nativeElement,
      this.node3Card?.nativeElement,
      this.node4Card?.nativeElement,
      this.node5Card?.nativeElement
    ];

    // Reseta temporariamente as transformações GSAP para medir a posição exata (scale 1.0, y 0) sem deslocamento
    allNodes.forEach(node => {
      if (node) gsap.set(node, { scale: 1, y: 0 });
    });

    const containerRect = this.portfolioContainer.nativeElement.getBoundingClientRect();

    const getCoords = (el: ElementRef<HTMLDivElement>) => {
      const rect = el.nativeElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2 - containerRect.left,
        xRight: rect.right - containerRect.left,
        yCenter: rect.top + rect.height / 2 - containerRect.top,
        yTop: rect.top - containerRect.top,
        yBottom: rect.bottom - containerRect.top
      };
    };

    const origin = getCoords(this.originDot);
    const n1 = getCoords(this.node1Card);
    const n2 = getCoords(this.node2Card);
    const n3 = getCoords(this.node3Card);
    const n4 = getCoords(this.node4Card);
    const n5 = getCoords(this.node5Card);

    // Restaura a escala/deslocamento original para os nós que ainda não foram revelados
    allNodes.forEach((node, idx) => {
      const isRevealed = this.revealedNodes.has(idx + 1);
      if (node && !isRevealed) {
        gsap.set(node, { scale: 0.85, y: 35 });
      }
    });

    // Conecta a lateral direita do ponto de origem (HTTPS) ao 1º cartão (vai reto, sobe um pouco e desce)
    this.path1.set(this.buildOriginToNode1Path(origin.xRight, origin.yCenter, n1.x, n1.yTop));
    this.path2.set(this.buildSPath(n1.x, n1.yBottom, n2.x, n2.yTop));
    this.path3.set(this.buildSPath(n2.x, n2.yBottom, n3.x, n3.yTop));
    this.path4.set(this.buildSPath(n3.x, n3.yBottom, n4.x, n4.yTop));
    this.path5.set(this.buildSPath(n4.x, n4.yBottom, n5.x, n5.yTop));
  }

  private setArrowState(
    arrowEl: SVGPathElement | undefined,
    state: { x: number; y: number; angle: number; visible: boolean }
  ): void {
    if (!arrowEl) return;
    if (!state.visible) {
      arrowEl.style.opacity = '0';
      arrowEl.removeAttribute('transform');
    } else {
      arrowEl.setAttribute('transform', `translate(${state.x}, ${state.y}) rotate(${state.angle})`);
      arrowEl.style.opacity = '1';
    }
  }

  private buildOriginToNode1Path(x1: number, y1: number, x2: number, y2: number): string {
    const dx = x2 - x1;
    const dy = y2 - y1;

    // Sai reto para a direita a partir da lateral do ponto e eleva-se levemente
    const cp1X = x1 + dx * 0.45;
    const cp1Y = y1 - 25;

    // Curva suavemente para baixo em direção à entrada superior do 1º nó
    const cp2X = x2;
    const cp2Y = y1 + dy * 0.35;

    return `M ${x1} ${y1} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${x2} ${y2}`;
  }

  private buildSPath(x1: number, y1: number, x2: number, y2: number): string {
    const midY = y1 + (y2 - y1) * 0.5;
    return `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
  }

  private initNodeScrollAnimations(): void {
    const nodes = [
      this.node1Card?.nativeElement,
      this.node2Card?.nativeElement,
      this.node3Card?.nativeElement,
      this.node4Card?.nativeElement,
      this.node5Card?.nativeElement
    ];

    // O ponto de origem (círculo preto) permanece visível.
    // Todos os cards 1 a 5 começam ocultos até serem atingidos pelas setas
    nodes.forEach((node) => {
      if (!node) return;
      gsap.set(node, {
        opacity: 0,
        scale: 0.85,
        y: 35
      });
    });
  }

  private isAutoNavigating = false;
  private currentNavigatedIndex = 0;
  private readonly revealedNodes = new Set<number>([0]);
  private autoNavTimer?: any;
  private autoNavTimeline?: gsap.core.Timeline;
  private autoNavHandler?: (e: Event) => void;
  private userScrollCleanup?: () => void;

  private setHttpsLabelVisible(visible: boolean): void {
    if (this.httpsLabel?.nativeElement) {
      gsap.to(this.httpsLabel.nativeElement, {
        opacity: visible ? 1 : 0,
        duration: 0.3,
        overwrite: 'auto'
      });
    }
  }

  private initPathScrollAnimations(): void {
    const connections = [
      { pathEl: this.pathEl1?.nativeElement, from: this.originDot?.nativeElement, to: this.node1Card?.nativeElement, targetNode: this.node1Card?.nativeElement, setArrow: (state: { x: number; y: number; angle: number; visible: boolean }) => this.setArrowState(this.arrowEl1?.nativeElement, state) },
      { pathEl: this.pathEl2?.nativeElement, from: this.node1Card?.nativeElement, to: this.node2Card?.nativeElement, targetNode: this.node2Card?.nativeElement, setArrow: (state: { x: number; y: number; angle: number; visible: boolean }) => this.setArrowState(this.arrowEl2?.nativeElement, state) },
      { pathEl: this.pathEl3?.nativeElement, from: this.node2Card?.nativeElement, to: this.node3Card?.nativeElement, targetNode: this.node3Card?.nativeElement, setArrow: (state: { x: number; y: number; angle: number; visible: boolean }) => this.setArrowState(this.arrowEl3?.nativeElement, state) },
      { pathEl: this.pathEl4?.nativeElement, from: this.node3Card?.nativeElement, to: this.node4Card?.nativeElement, targetNode: this.node4Card?.nativeElement, setArrow: (state: { x: number; y: number; angle: number; visible: boolean }) => this.setArrowState(this.arrowEl4?.nativeElement, state) },
      { pathEl: this.pathEl5?.nativeElement, from: this.node4Card?.nativeElement, to: this.node5Card?.nativeElement, targetNode: this.node5Card?.nativeElement, setArrow: (state: { x: number; y: number; angle: number; visible: boolean }) => this.setArrowState(this.arrowEl5?.nativeElement, state) }
    ];

    // Escuta evento customizado disparado pelos links do menu no header
    this.autoNavHandler = (e: Event) => {
      const customEv = e as CustomEvent<{ targetId: string }>;
      if (customEv.detail && customEv.detail.targetId) {
        this.handleAutoNavigate(customEv.detail.targetId, connections);
      }
    };
    window.addEventListener('portfolio-auto-navigate', this.autoNavHandler);

    connections.forEach(({ pathEl, from, to, targetNode, setArrow }, index) => {
      if (!pathEl || !from || !to) return;

      const length = pathEl.getTotalLength();
      const targetIdx = index + 1;

      pathEl.removeAttribute('marker-end');
      gsap.set(pathEl, {
        opacity: 0,
        strokeDasharray: length,
        strokeDashoffset: length
      });
      setArrow({ x: 0, y: 0, angle: 0, visible: false });

      const startTrigger = index === 0 ? 'top 85%' : 'center 60%';

      const dummy = { progress: 0 };
      const tween = gsap.to(dummy, {
        progress: 1,
        ease: 'none',
        scrollTrigger: {
          trigger: from,
          endTrigger: to,
          start: `${startTrigger}`,
          end: 'center 60%',
          scrub: true,
          onUpdate: (self) => {
            if (this.isAutoNavigating) return;

            const length = pathEl.getTotalLength() || 1;

            // No topo da página (F5 ou scroll no topo do Hero), força traçados, setas e texto HTTPS invisíveis caso o nó 0 ainda esteja ativo
            if (this.currentNavigatedIndex === 0 && typeof window !== 'undefined' && window.scrollY <= 10) {
              this.setHttpsLabelVisible(false);
              gsap.set(pathEl, { opacity: 0, strokeDashoffset: length });
              setArrow({ x: 0, y: 0, angle: 0, visible: false });
              return;
            } else {
              this.setHttpsLabelVisible(true);
            }

            // Se estiver no topo da página (scrollY <= 50) e no 1º nó, apenas a conexão 0 fica ativa e revelada;
            // nenhuma outra seta (conexão 1 em diante) deve sair do nó até o usuário iniciar o scroll manual.
            if (typeof window !== 'undefined' && window.scrollY <= 50 && this.currentNavigatedIndex === 1) {
              if (index === 0) {
                gsap.set(pathEl, { opacity: 1, strokeDashoffset: 0 });
                setArrow({ x: 0, y: 0, angle: 90, visible: false });
                if (targetNode) gsap.set(targetNode, { opacity: 1, scale: 1, y: 0 });
                this.activateNodeColor(1, true);
                return;
              }
              if (index >= 1) {
                gsap.set(pathEl, { opacity: 0, strokeDashoffset: length });
                setArrow({ x: 0, y: 0, angle: 0, visible: false });
                this.deactivateNodeColor(targetIdx, true);
                return;
              }
            }

            const progress = self.progress;
            const currentLen = length * progress;
            const pt = pathEl.getPointAtLength(Math.min(currentLen, length));

            if (index < this.currentNavigatedIndex) {
              gsap.set(pathEl, { opacity: 1, strokeDashoffset: 0 });
              setArrow({ x: 0, y: 0, angle: 90, visible: false });
              if (targetNode) {
                gsap.set(targetNode, { opacity: 1, scale: 1, y: 0 });
              }
              this.activateNodeColor(targetIdx, true);
              return;
            }

            if (progress > 0.01) {
              gsap.set(pathEl, { opacity: 1, strokeDashoffset: length - currentLen });

              const arrowLen = Math.min(currentLen + 5, length);
              const pt = pathEl.getPointAtLength(arrowLen);

              if (index === 1 && progress >= 0.50) {
                this.animateAboutText();
              }
              if (index === 2 && progress >= 0.35) {
                this.animateSkillsText();
              }
              if (index === 3 && progress >= 0.65) {
                this.animateProjectsText();
              }
              if (index === 4 && progress >= 0.95) {
                this.animateContactButton();
              }

              if (progress >= 0.99) {
                this.currentNavigatedIndex = targetIdx;
                this.revealedNodes.add(targetIdx);
                setArrow({ x: pt.x, y: pt.y, angle: 90, visible: false });
                if (targetNode) {
                  gsap.to(targetNode, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'back.out(1.7)',
                    overwrite: 'auto'
                  });
                }
                this.activateNodeColor(targetIdx);
              } else {
                const ptPrev = pathEl.getPointAtLength(Math.max(0, arrowLen - 2));
                const ptNext = pathEl.getPointAtLength(Math.min(arrowLen + 2, length));
                const angle = Math.atan2(ptNext.y - ptPrev.y, ptNext.x - ptPrev.x) * (180 / Math.PI);
                setArrow({ x: pt.x, y: pt.y, angle, visible: true });

                if (progress >= 0.60) {
                  if (targetNode) {
                    gsap.to(targetNode, {
                      opacity: 1,
                      scale: 1,
                      y: 0,
                      duration: 0.4,
                      ease: 'back.out(1.7)',
                      overwrite: 'auto'
                    });
                  }
                  this.deactivateNodeColor(targetIdx);
                } else {
                  if (targetNode) {
                    gsap.set(targetNode, { opacity: 0, scale: 0.85, y: 35 });
                  }
                  this.deactivateNodeColor(targetIdx);
                }
              }
            } else {
              gsap.set(pathEl, { opacity: 0, strokeDashoffset: length });
              setArrow({ x: 0, y: 0, angle: 0, visible: false });
              if (targetNode) {
                gsap.set(targetNode, { opacity: 0, scale: 0.85, y: 35 });
              }
              this.deactivateNodeColor(targetIdx);
            }
          }
        }
      });

      if (tween.scrollTrigger) {
        this.triggers.push(tween.scrollTrigger);
      }
    });
  }

  private initSectionScrollAnimations(): void {
    if (typeof document === 'undefined') return;

    const sections = [
      { id: 'about', animate: () => this.animateAboutText() },
      { id: 'skills', animate: () => this.animateSkillsText() },
      { id: 'projects', animate: () => this.animateProjectsText() }
    ];

    sections.forEach(({ id, animate }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const st = ScrollTrigger.create({
        trigger: el,
        start: 'top 75%',
        onEnter: () => animate(),
        onEnterBack: () => animate(),
        onUpdate: (self) => {
          if (self.isActive && typeof window !== 'undefined' && window.scrollY > 35) {
            animate();
          }
        }
      });

      this.triggers.push(st);
    });

    const contactBtnEl = document.querySelector('.contact-submit-btn');
    if (contactBtnEl) {
      const st = ScrollTrigger.create({
        trigger: contactBtnEl,
        start: 'top 90%',
        onEnter: () => this.animateContactButton(),
        onEnterBack: () => this.animateContactButton()
      });
      this.triggers.push(st);
    }
  }

  private readonly AUTO_NAV_DURATION = 1.1;

  private handleAutoNavigate(
    targetId: string,
    connections: Array<{
      pathEl?: SVGPathElement;
      targetNode?: HTMLDivElement;
      setArrow: (state: { x: number; y: number; angle: number; visible: boolean }) => void;
    }>
  ): void {
    this.isAutoNavigating = true;

    if (this.autoNavTimer) {
      clearTimeout(this.autoNavTimer);
      this.autoNavTimer = undefined;
    }
    if (this.userScrollCleanup) {
      this.userScrollCleanup();
      this.userScrollCleanup = undefined;
    }
    if (this.autoNavTimeline) {
      this.autoNavTimeline.kill();
      this.autoNavTimeline = undefined;
    }

    ScrollTrigger.getAll().forEach(t => t.disable(false));

    const finishAutoNav = () => {
      if (this.autoNavTimer) {
        clearTimeout(this.autoNavTimer);
        this.autoNavTimer = undefined;
      }
      if (this.userScrollCleanup) {
        this.userScrollCleanup();
        this.userScrollCleanup = undefined;
      }
      this.isAutoNavigating = false;
      ScrollTrigger.getAll().forEach(t => t.enable(false));
      ScrollTrigger.refresh();
    };

    if (targetId === 'hero') {
      finishAutoNav();
      this.resetAndPlayHeroAnimation(true);
      return;
    }

    const targetIndexMap: Record<string, number> = {
      hero: 0,
      about: 2,
      skills: 3,
      projects: 4,
      contact: 5
    };

    const targetIdx = targetIndexMap[targetId] ?? 0;
    this.currentNavigatedIndex = targetIdx;

    if (targetIdx === 0) {
      this.setHttpsLabelVisible(false);
    } else {
      this.setHttpsLabelVisible(true);
    }

    const allNodes = [
      this.originDot?.nativeElement,
      this.node1Card?.nativeElement,
      this.node2Card?.nativeElement,
      this.node3Card?.nativeElement,
      this.node4Card?.nativeElement,
      this.node5Card?.nativeElement
    ];

    this.revealedNodes.clear();
    for (let i = 0; i <= targetIdx; i++) {
      this.revealedNodes.add(i);
    }

    connections.forEach((conn, idx) => {
      const { pathEl, targetNode, setArrow } = conn;
      if (!pathEl) return;

      const length = pathEl.getTotalLength() || 1;

      if (idx < targetIdx - 1) {
        gsap.set(pathEl, { opacity: 1, strokeDashoffset: 0 });
        setArrow({ x: 0, y: 0, angle: 0, visible: false });
        if (targetNode) {
          gsap.set(targetNode, { opacity: 1, scale: 1, y: 0 });
        }
        this.activateNodeColor(idx + 1, true);
      } else if (idx >= targetIdx) {
        gsap.set(pathEl, { opacity: 0, strokeDashoffset: length });
        setArrow({ x: 0, y: 0, angle: 0, visible: false });
        if (targetNode) {
          gsap.set(targetNode, { opacity: 0, scale: 0.85, y: 35 });
        }
        this.deactivateNodeColor(idx + 1, true);
      }
    });

    const targetCard = allNodes[targetIdx];

    if (targetIdx > 0 && targetIdx <= connections.length) {
      const connIndex = targetIdx - 1;
      const { pathEl, setArrow } = connections[connIndex];

      if (pathEl) {
        const length = pathEl.getTotalLength() || 1;
        gsap.set(pathEl, { opacity: 1, strokeDashoffset: length });

        const animObj = { progress: 0 };
        this.autoNavTimeline = gsap.timeline();
        this.autoNavTimeline.to(animObj, {
          progress: 1,
          duration: this.AUTO_NAV_DURATION,
          ease: 'power2.inOut',
          onUpdate: () => {
            const p = animObj.progress;
            const currentLen = length * p;
            gsap.set(pathEl, { strokeDashoffset: length - currentLen });

            if (p >= 0.95) {
              this.triggerTargetSectionAnimation(targetIdx);
            }

            const arrowLen = Math.min(currentLen + 5, length);
            const pt = pathEl.getPointAtLength(arrowLen);
            if (p >= 0.995) {
              setArrow({ x: pt.x, y: pt.y, angle: 90, visible: false });
              if (targetCard) {
                gsap.to(targetCard, {
                  opacity: 1,
                  scale: 1,
                  y: 0,
                  duration: 0.4,
                  ease: 'back.out(1.7)',
                  overwrite: 'auto'
                });
              }
              this.activateNodeColor(targetIdx);
            } else {
              const ptPrev = pathEl.getPointAtLength(Math.max(0, arrowLen - 2));
              const ptNext = pathEl.getPointAtLength(Math.min(arrowLen + 2, length));
              const angle = Math.atan2(ptNext.y - ptPrev.y, ptNext.x - ptPrev.x) * (180 / Math.PI);
              setArrow({ x: pt.x, y: pt.y, angle, visible: true });

              if (p >= 0.60) {
                if (targetCard) {
                  gsap.to(targetCard, {
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    duration: 0.4,
                    ease: 'back.out(1.7)',
                    overwrite: 'auto'
                  });
                }
                this.deactivateNodeColor(targetIdx);
              } else {
                if (targetCard) {
                  gsap.set(targetCard, { opacity: 0, scale: 0.85, y: 35 });
                }
                this.deactivateNodeColor(targetIdx);
              }
            }
          },
          onComplete: () => {
            gsap.set(pathEl, { strokeDashoffset: 0, opacity: 1 });
            setArrow({ x: 0, y: 0, angle: 0, visible: false });
            if (targetCard) {
              gsap.set(targetCard, { opacity: 1, scale: 1, y: 0 });
            }
            this.activateNodeColor(targetIdx, true);
            this.triggerTargetSectionAnimation(targetIdx);
            finishAutoNav();
          }
        });
      } else {
        if (targetCard) {
          gsap.to(targetCard, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)', overwrite: 'auto' });
        }
        this.triggerTargetSectionAnimation(targetIdx);
        finishAutoNav();
      }
    } else {
      if (targetCard) {
        gsap.to(targetCard, { opacity: 1, scale: 1, y: 0, duration: 0.4, ease: 'back.out(1.7)', overwrite: 'auto' });
      }
      this.triggerTargetSectionAnimation(targetIdx);
      finishAutoNav();
    }

    const onUserInteract = () => {
      finishAutoNav();
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('wheel', onUserInteract, { passive: true, once: true });
      window.addEventListener('touchmove', onUserInteract, { passive: true, once: true });
      window.addEventListener('keydown', onUserInteract, { passive: true, once: true });

      this.userScrollCleanup = () => {
        window.removeEventListener('wheel', onUserInteract);
        window.removeEventListener('touchmove', onUserInteract);
        window.removeEventListener('keydown', onUserInteract);
      };
    }

    this.autoNavTimer = setTimeout(() => {
      finishAutoNav();
    }, Math.round(this.AUTO_NAV_DURATION * 1000) + 100);
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.autoNavHandler && typeof window !== 'undefined') {
      window.removeEventListener('portfolio-auto-navigate', this.autoNavHandler);
    }
    if (this.userScrollCleanup) {
      this.userScrollCleanup();
    }
    if (this.autoNavTimer) {
      clearTimeout(this.autoNavTimer);
    }
    if (this.autoNavTimeline) {
      this.autoNavTimeline.kill();
    }
    if (this.skillsTimeline) {
      this.skillsTimeline.kill();
    }
    this.triggers.forEach(t => t.kill());
  }

  Link2 = Link2;
  Webhook = Webhook;
  Store = Store;
  GitBranch = GitBranch;
  Braces = Braces;

  skillCategories = signal<SkillCategory[]>([
    {
      category: 'Backend',
      items: [
        { name: 'Java', icon: 'devicon-java-plain', iconType: 'devicon' },
        { name: 'Spring Boot', icon: 'devicon-spring-plain', iconType: 'devicon' },
        { name: 'REST API', icon: 'devicon-fastapi-plain', iconType: 'devicon' },
        { name: 'JWT', icon: 'devicon-json-plain', iconType: 'devicon' },
        { name: 'HATEOAS', icon: 'Link2', iconType: 'lucide' },
        { name: 'MapStruct', icon: 'Braces', iconType: 'lucide' },
        { name: 'Flyway', icon: 'Flyway_logo.svg', iconType: 'image' }
      ]
    },

    {
      category: 'Automation',
      items: [
        { name: 'n8n', icon: 'n8n.png', iconType: 'image' },
        { name: 'Webhooks', icon: 'Webhook', iconType: 'lucide' },
        { name: 'Marketplace APIs', icon: 'Store', iconType: 'lucide' }
      ]
    },

    {
      category: 'Frontend',
      items: [
        { name: 'Angular', icon: 'devicon-angularjs-plain', iconType: 'devicon' },
        { name: 'TypeScript', icon: 'devicon-typescript-plain', iconType: 'devicon' },
        { name: 'Angular Material', icon: 'devicon-materialui-plain', iconType: 'devicon' },
        { name: 'Bootstrap', icon: 'devicon-bootstrap-plain', iconType: 'devicon' },
        { name: 'Tailwind CSS', icon: 'devicon-tailwindcss-plain', iconType: 'devicon' },
        { name: 'RxJS', icon: 'devicon-rxjs-plain', iconType: 'devicon' }
      ]
    },

    {
      category: 'Monitoring',
      items: [
        { name: 'Prometheus', icon: 'devicon-prometheus-plain', iconType: 'devicon' },
        { name: 'Grafana', icon: 'devicon-grafana-plain', iconType: 'devicon' },
        { name: 'JUnit', icon: 'devicon-junit-plain', iconType: 'devicon' },
        { name: 'Mockito', icon: 'logo-mockito.png', iconType: 'image' },
        { name: 'Spring Test', icon: 'devicon-spring-plain', iconType: 'devicon' }
      ]
    },

    {
      category: 'Database',
      items: [
        { name: 'PostgreSQL', icon: 'devicon-postgresql-plain', iconType: 'devicon' },
        { name: 'MongoDB', icon: 'devicon-mongodb-plain', iconType: 'devicon' },
        { name: 'Redis', icon: 'devicon-redis-plain', iconType: 'devicon' }
      ]
    },

    {
      category: 'Tools',
      items: [
        { name: 'Git', icon: 'devicon-git-plain', iconType: 'devicon' },
        { name: 'GitHub', icon: 'devicon-github-original', iconType: 'devicon' },
        { name: 'Swagger', icon: 'devicon-swagger-plain', iconType: 'devicon' },
        { name: 'OpenAPI', icon: 'devicon-openapi-plain', iconType: 'devicon' },
        { name: 'Linux', icon: 'devicon-linux-plain', iconType: 'devicon' }
      ]
    },

    {
      category: 'DevOps',
      items: [
        { name: 'Docker', icon: 'devicon-docker-plain', iconType: 'devicon' },
        { name: 'Kubernetes', icon: 'devicon-kubernetes-plain', iconType: 'devicon' },
        { name: 'Nginx', icon: 'devicon-nginx-plain', iconType: 'devicon' },
        { name: 'Azure', icon: 'devicon-azure-plain', iconType: 'devicon' },
        { name: 'Oracle Cloud', icon: 'devicon-oracle-plain', iconType: 'devicon' },
        { name: 'GitHub Actions', icon: 'devicon-githubactions-plain', iconType: 'devicon' },
        { name: 'CI/CD', icon: 'GitBranch', iconType: 'lucide' }
      ]
    }
  ]);

  projects = signal<Project[]>([
    {
      title: 'Order Integration API',
      year: '2026 - Atual',
      description: 'API RESTful com Java Spring Boot...',
      techs: ['Java', 'Spring Boot', 'Redis', 'PostgreSQL'],
      link: 'https://github.com/ImViniciusOliveira/order-integration-api'
    },
    {
      title: 'DCriar - ERP de Estoque',
      year: '2025 - 2026',
      description: 'Solução ERP full stack em monorepo...',
      techs: ['Angular SSR', 'Spring Boot', 'MinIO'],
      link: 'https://github.com/ImViniciusOliveira/DCriar-gerenciamento'
    },
    {
      title: 'UpGeek E-commerce',
      year: '2025 - 2026',
      description: 'Plataforma de e-commerce voltada para colecionáveis...',
      techs: ['Microsserviços', 'HATEOAS', 'Flyway'],
      link: 'https://github.com/ImViniciusOliveira/upgeek-api'
    }
  ]);

  contactForm = signal({
    name: '',
    email: '',
    message: ''
  });

  isSubmitting = signal(false);
  submitSuccess = signal(false);

  onSubmit(): void {
    const { email, message } = this.contactForm();

    if (!email || !message) {
      return;
    }

    this.isSubmitting.set(true);

    setTimeout(() => {
      this.isSubmitting.set(false);
      this.submitSuccess.set(true);

      this.contactForm.set({
        name: '',
        email: '',
        message: ''
      });
    }, 1000);
  }
}
